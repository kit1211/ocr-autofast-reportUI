import { useState } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Calendar } from 'lucide-react';

interface DateRangeSelectorProps {
  onRangeChange: (range: { type: 'days' | 'custom'; days?: number; startDate?: string; endDate?: string }) => void;
  defaultDays?: number;
}

type DateRangeOption = '7' | '15' | '30' | 'custom';

export function DateRangeSelector({ onRangeChange, defaultDays = 7 }: DateRangeSelectorProps) {
  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('7');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleRangeChange = (value: DateRangeOption) => {
    setSelectedRange(value);
    
    if (value === 'custom') {
      setShowCustomInput(true);
      // Set default dates (today and 7 days ago)
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      
      const todayStr = today.toISOString().split('T')[0];
      const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];
      
      setStartDate(sevenDaysAgoStr);
      setEndDate(todayStr);
    } else {
      setShowCustomInput(false);
      const days = parseInt(value, 10);
      onRangeChange({ type: 'days', days });
    }
  };

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

