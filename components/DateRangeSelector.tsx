'use client';

import { useState, useEffect as React_useEffect } from 'react';
import * as React from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  onRangeChange: (range: { type: 'days' | 'custom'; days?: number; startDate?: string; endDate?: string }) => void;
  defaultDays?: number;
}

type DateRangeOption = '7' | '15' | '30' | 'lottery' | 'custom';

// Calculate lottery period dates (Thai lottery: 1st and 16th of each month)
function getLotteryPeriodDates(): { startDate: string; endDate: string } {
  const today = new Date();
  const day = today.getDate();
  
  let startDate: Date;
  const endDate = new Date(today); // Today
  
  if (day >= 2 && day <= 16) {
    // Period: 2nd to 16th → Start from 2nd of current month
    startDate = new Date(today.getFullYear(), today.getMonth(), 2);
  } else if (day === 1) {
    // Day 1 is the last day of previous period → Start from 17th of previous month
    startDate = new Date(today.getFullYear(), today.getMonth() - 1, 17);
  } else {
    // Period: 17th to 31st/1st → Start from 17th of current month
    startDate = new Date(today.getFullYear(), today.getMonth(), 17);
  }
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

export function DateRangeSelector({ onRangeChange, defaultDays = 7 }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('lottery');
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Calculate lottery period dates as default
  const lotteryDates = getLotteryPeriodDates();
  const [startDate, setStartDate] = useState<string>(lotteryDates.startDate);
  const [endDate, setEndDate] = useState<string>(lotteryDates.endDate);

  const handleRangeChange = (value: DateRangeOption) => {
    setSelectedRange(value);
    
    if (value === 'lottery') {
      setShowCustomInput(false);
      // Use lottery period dates
      const dates = getLotteryPeriodDates();
      setStartDate(dates.startDate);
      setEndDate(dates.endDate);
      onRangeChange({ 
        type: 'custom', 
        startDate: dates.startDate, 
        endDate: dates.endDate 
      });
    } else if (value === 'custom') {
      setShowCustomInput(true);
      // Keep current dates or use lottery dates as initial
      if (!startDate || !endDate) {
        const dates = getLotteryPeriodDates();
        setStartDate(dates.startDate);
        setEndDate(dates.endDate);
      }
    } else {
      setShowCustomInput(false);
      const days = parseInt(value, 10);
      onRangeChange({ type: 'days', days });
    }
  };
  
  // Set initial range to lottery period on mount
  React_useEffect(() => {
    const dates = getLotteryPeriodDates();
    onRangeChange({ 
      type: 'custom', 
      startDate: dates.startDate, 
      endDate: dates.endDate 
    });
  }, []); // Empty dependency array = run once on mount

  const handleCustomSubmit = () => {
    if (!startDate || !endDate) {
      alert('กรุณาเลือกวันที่เริ่มต้นและสิ้นสุด');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      alert('วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด');
      return;
    }

    // Calculate days difference
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      alert('ช่วงเวลาต้องไม่เกิน 365 วัน');
      return;
    }

    onRangeChange({ 
      type: 'custom', 
      startDate: startDate, 
      endDate: endDate 
    });
  };

  return (
    <div className="flex items-end gap-4 flex-wrap">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="date-range" className="mb-2 block">
          ช่วงเวลา
        </Label>
        <Select value={selectedRange} onValueChange={handleRangeChange}>
          <SelectTrigger id="date-range" className="w-full">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="เลือกช่วงเวลา" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lottery">ช่วงหวยปัจจุบัน (Default)</SelectItem>
            <SelectItem value="7">7 วันล่าสุด</SelectItem>
            <SelectItem value="15">15 วันล่าสุด</SelectItem>
            <SelectItem value="30">30 วันล่าสุด</SelectItem>
            <SelectItem value="custom">กำหนดเอง</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showCustomInput && (
        <div className="flex gap-2 items-end flex-wrap">
          <div>
            <Label htmlFor="start-date" className="mb-2 block">
              วันที่เริ่มต้น
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div>
            <Label htmlFor="end-date" className="mb-2 block">
              วันที่สิ้นสุด
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <Button onClick={handleCustomSubmit}>
            ค้นหา
          </Button>
        </div>
      )}
    </div>
  );
}

