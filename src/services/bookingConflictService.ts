/**
 * WAMAS ERP - Anti-Double Booking Engine & 48-Hour Buffer Service
 * Enforces BR-01, BR-11, BR-12 & BR-15
 */

import { ProductUnit, Booking, BookingItem } from '../types';

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictReason?: 'DIRECT_OVERLAP' | 'BUFFER_48H_VIOLATION' | 'UNIT_UNAVAILABLE_STATUS';
  conflictingBookingNumber?: string;
  conflictingDates?: { start: string; end: string };
  message: string;
  alternativeUnits: {
    unitId: string;
    serialNumber: string;
    productName: string;
    size: string;
    color: string;
  }[];
}

export class BookingConflictService {
  private static BUFFER_HOURS = 48; // 48-Hour Buffer for Dry Cleaning & Preparation

  /**
   * Check if a product unit can be booked for the specified dates.
   * Mathematical logic: (existing_start < requested_end) AND (existing_end > requested_start)
   * With 48h Buffer: expand the requested window by ±48 hours.
   */
  public static checkAvailability(
    unit: ProductUnit,
    requestedStartStr: string,
    requestedEndStr: string,
    existingBookings: Booking[],
    allUnits: ProductUnit[],
    productName: string
  ): ConflictCheckResult {
    // 1. Status Check: Damaged, Lost or Cleaning cannot be booked
    if (unit.status === 'DAMAGED' || unit.status === 'LOST') {
      return {
        hasConflict: true,
        conflictReason: 'UNIT_UNAVAILABLE_STATUS',
        message: `القطعة رقم (${unit.serialNumber}) غير متاحة حالياً بسبب حالتها التشغيلية (${unit.status === 'DAMAGED' ? 'تالفة وقيد الإصلاح' : 'مفقودة'}).`,
        alternativeUnits: this.findAlternatives(unit, requestedStartStr, requestedEndStr, existingBookings, allUnits, productName)
      };
    }

    const reqStart = new Date(requestedStartStr).getTime();
    const reqEnd = new Date(requestedEndStr).getTime();

    if (isNaN(reqStart) || isNaN(reqEnd) || reqStart >= reqEnd) {
      return {
        hasConflict: true,
        message: 'تواريخ الحجز غير صحيحة، يجب أن يكون تاريخ النهاية بعد تاريخ البداية.',
        alternativeUnits: []
      };
    }

    const bufferMs = this.BUFFER_HOURS * 60 * 60 * 1000;
    const reqStartWithBuffer = reqStart - bufferMs;
    const reqEndWithBuffer = reqEnd + bufferMs;

    // 2. Iterate through all active bookings for this unit
    for (const booking of existingBookings) {
      if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') {
        continue; // Closed bookings do not conflict
      }

      for (const item of booking.items) {
        if (item.productUnitId === unit.id) {
          const existStart = new Date(item.startDate).getTime();
          const existEnd = new Date(item.endDate).getTime();

          // A) Direct Overlap Check: existingStart < requestedEnd AND existingEnd > requestedStart
          const isDirectOverlap = existStart < reqEnd && existEnd > reqStart;
          if (isDirectOverlap) {
            return {
              hasConflict: true,
              conflictReason: 'DIRECT_OVERLAP',
              conflictingBookingNumber: booking.bookingNumber,
              conflictingDates: { start: item.startDate, end: item.endDate },
              message: `تعارض حجز مباشر! القطعة (${unit.serialNumber}) محجوزة بالفعل في العقد (${booking.bookingNumber}) للفترة من ${item.startDate} إلى ${item.endDate}.`,
              alternativeUnits: this.findAlternatives(unit, requestedStartStr, requestedEndStr, existingBookings, allUnits, productName)
            };
          }

          // B) 48-Hour Buffer Overlap Check
          const existStartWithBuffer = existStart - bufferMs;
          const existEndWithBuffer = existEnd + bufferMs;

          const isBufferOverlap = existStartWithBuffer < reqEndWithBuffer && existEndWithBuffer > reqStartWithBuffer;
          if (isBufferOverlap) {
            return {
              hasConflict: true,
              conflictReason: 'BUFFER_48H_VIOLATION',
              conflictingBookingNumber: booking.bookingNumber,
              conflictingDates: { start: item.startDate, end: item.endDate },
              message: `رفض بسبب هامش الأمان الإجباري (48 ساعة غسيل وتجهيز)! القطعة تنتهي أو تبدأ بحجز آخر (${booking.bookingNumber}) في تاريخ ${item.endDate} ويفصل بينهما أقل من 48 ساعة.`,
              alternativeUnits: this.findAlternatives(unit, requestedStartStr, requestedEndStr, existingBookings, allUnits, productName)
            };
          }
        }
      }
    }

    return {
      hasConflict: false,
      message: 'القطعة متاحة بالكامل وتلبي شروط هامش الأمان (48 ساعة).',
      alternativeUnits: []
    };
  }

  /**
   * Automatically finds matching alternate available units of the same product or size
   */
  private static findAlternatives(
    targetUnit: ProductUnit,
    startStr: string,
    endStr: string,
    existingBookings: Booking[],
    allUnits: ProductUnit[],
    productName: string
  ) {
    const alternatives: { unitId: string; serialNumber: string; productName: string; size: string; color: string }[] = [];

    const candidates = allUnits.filter(
      u => u.id !== targetUnit.id && 
           (u.productId === targetUnit.productId || u.size === targetUnit.size) &&
           u.status !== 'DAMAGED' && 
           u.status !== 'LOST'
    );

    for (const cand of candidates) {
      const check = this.checkAvailability(cand, startStr, endStr, existingBookings, allUnits, productName);
      if (!check.hasConflict) {
        alternatives.push({
          unitId: cand.id,
          serialNumber: cand.serialNumber,
          productName: productName,
          size: cand.size,
          color: cand.color
        });
      }
      if (alternatives.length >= 3) break;
    }

    return alternatives;
  }
}
