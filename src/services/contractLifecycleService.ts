/**
 * WAMAS ERP - 12-Stage Rental Contract Lifecycle Service
 * Enforces BR-02, BR-03, BR-04, BR-08, BR-14, BR-17, BR-18, BR-19
 */

import { RentalContract, Booking, Collateral, Inspection, ProductUnit, ContractStage } from '../types';

export interface StageTransitionResult {
  success: boolean;
  contract?: RentalContract;
  error?: string;
  nextAllowedStage?: ContractStage;
  automatedTrigger?: {
    taskToCreate?: {
      title: string;
      type: string;
      assignedRole: string;
      priority: 'URGENT' | 'HIGH' | 'MEDIUM';
      dueHours: number;
    };
    unitStatusChange?: {
      unitId: string;
      newStatus: string;
      cleaningDurationHours?: number;
    };
  };
}

export class ContractLifecycleService {
  /**
   * Calculate late penalty: daysLate * 15% of daily rental rate, capped at total collateral amount
   */
  public static calculateLatePenalty(dailyRate: number, daysLate: number, collateralAmount: number): number {
    if (daysLate <= 0) return 0;
    const penaltyPerDay = dailyRate * 0.15;
    const totalPenalty = daysLate * penaltyPerDay;
    return Math.min(totalPenalty, collateralAmount);
  }

  /**
   * Calculate settlement breakdown
   */
  public static calculateSettlement(
    collateralAmount: number,
    latePenalty: number,
    damagePenalty: number,
    lostFee: number = 0
  ): {
    totalDeductions: number;
    refundAmount: number;
    additionalDue: number;
  } {
    const totalDeductions = latePenalty + damagePenalty + lostFee;
    if (collateralAmount >= totalDeductions) {
      return {
        totalDeductions,
        refundAmount: collateralAmount - totalDeductions,
        additionalDue: 0
      };
    } else {
      return {
        totalDeductions,
        refundAmount: 0,
        additionalDue: totalDeductions - collateralAmount
      };
    }
  }

  /**
   * Validate if contract can transition from currentStage to targetStage
   */
  public static canTransitionStage(
    contract: RentalContract,
    targetStage: ContractStage,
    booking: Booking,
    collaterals: Collateral[],
    inspections: Inspection[],
    productUnit: ProductUnit
  ): { canTransition: boolean; error?: string } {
    // Stage 3 to 4: Deposit Verification
    if (targetStage >= 3 && booking.depositPaid < booking.depositRequired) {
      return {
        canTransition: false,
        error: `رفض الانتقال! العربون المدفوع (${booking.depositPaid}) أقل من العربون الإجباري المطلوب (${booking.depositRequired}) - نسبة 25% على الأقل.`
      };
    }

    // Stage 5 to 6: Collateral Verification (BR-03)
    if (targetStage >= 5) {
      const activeCollateral = collaterals.find(c => c.contractId === contract.id && c.status === 'HELD');
      if (!activeCollateral && booking.collateralPaid < booking.collateralRequired) {
        return {
          canTransition: false,
          error: 'رفض الانتقال (قاعدة BR-03)! يُحظر المتابعة قبل تسجيل واستلام التأمين كاملاً أو إيداع أمانة عينية معتمدة.'
        };
      }
    }

    // Stage 7: Delivery requires pre-delivery inspection with photo (BR-17)
    if (targetStage === 7) {
      const preInspection = inspections.find(i => i.contractId === contract.id && i.type === 'PRE_DELIVERY');
      if (!preInspection || preInspection.photos.length === 0) {
        return {
          canTransition: false,
          error: 'رفض التسليم (قاعدة BR-17)! لا يمكن إتمام التسليم للعميل دون رفع صور توثيق حالة الصنف واعتمادها.'
        };
      }
    }

    // Stage 12: Closure requires return inspection (BR-04)
    if (targetStage === 12) {
      const postInspection = inspections.find(i => i.contractId === contract.id && i.type === 'POST_RETURN');
      if (!postInspection || postInspection.photos.length === 0) {
        return {
          canTransition: false,
          error: 'رفض إغلاق العقد (قاعدة BR-04)! لا يمكن إغلاق العقد والتسوية دون إتمام تقرير الفحص بعد الإرجاع وتوثيقه بالصور.'
        };
      }
    }

    return { canTransition: true };
  }

  /**
   * Advance contract to the next operational stage
   */
  public static advanceStage(
    contract: RentalContract,
    booking: Booking,
    collaterals: Collateral[],
    inspections: Inspection[],
    productUnit: ProductUnit
  ): StageTransitionResult {
    const nextStage = (contract.currentStage + 1) as ContractStage;
    if (nextStage > 12) {
      return { success: false, error: 'العقد وصل للمرحلة النهائية وهو مغلق بالفعل.' };
    }

    const check = this.canTransitionStage(contract, nextStage, booking, collaterals, inspections, productUnit);
    if (!check.canTransition) {
      return { success: false, error: check.error };
    }

    const updatedContract: RentalContract = {
      ...contract,
      currentStage: nextStage
    };

    let automatedTrigger: StageTransitionResult['automatedTrigger'] = undefined;

    // Trigger side-effects based on stage
    if (nextStage === 3) {
      // Deposit confirmed -> generate preparation task
      automatedTrigger = {
        taskToCreate: {
          title: `تجهيز وخياطة الصنف (${productUnit.serialNumber}) لعقد ${contract.contractNumber}`,
          type: 'PREPARATION',
          assignedRole: 'TAILOR',
          priority: 'HIGH',
          dueHours: 48
        },
        unitStatusChange: {
          unitId: productUnit.id,
          newStatus: 'READY_FOR_DELIVERY'
        }
      };
    } else if (nextStage === 7) {
      // Delivered
      automatedTrigger = {
        unitStatusChange: {
          unitId: productUnit.id,
          newStatus: 'DELIVERED'
        }
      };
    } else if (nextStage === 9) {
      // Returned -> generate inspection task
      automatedTrigger = {
        taskToCreate: {
          title: `فحص الصنف (${productUnit.serialNumber}) بعد الإرجاع لعقد ${contract.contractNumber}`,
          type: 'INSPECTION',
          assignedRole: 'WAREHOUSE',
          priority: 'URGENT',
          dueHours: 6
        },
        unitStatusChange: {
          unitId: productUnit.id,
          newStatus: 'PENDING_INSPECTION'
        }
      };
    } else if (nextStage === 12) {
      // Contract Closed -> Enforce BR-08: Mandatory 24h CLEANING
      updatedContract.status = 'CLOSED';
      automatedTrigger = {
        taskToCreate: {
          title: `غسيل جاف وتعقيم وكي إجباري (24 ساعة) للقطعة ${productUnit.serialNumber}`,
          type: 'CLEANING',
          assignedRole: 'WAREHOUSE',
          priority: 'MEDIUM',
          dueHours: 24
        },
        unitStatusChange: {
          unitId: productUnit.id,
          newStatus: 'CLEANING',
          cleaningDurationHours: 24
        }
      };
    }

    return {
      success: true,
      contract: updatedContract,
      nextAllowedStage: nextStage,
      automatedTrigger
    };
  }
}
