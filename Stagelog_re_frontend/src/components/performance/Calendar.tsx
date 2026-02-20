import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { CalendarPerformance } from '../../types/performance.types';
import { formatYearMonth, getNextMonth, getPrevMonth } from '../../utils/dateFormatter';
import PerformanceDayModal from './PerformanceDayModal';

interface CalendarProps {
  year: number;
  month: number;
  performances: CalendarPerformance[];
  onMonthChange: (year: number, month: number) => void;
}

/**
 * 캘린더 컴포넌트 - Neon Night 테마
 * 다크 배경 + 네온 칩 + 글로우 효과 + 날짜 클릭 모달
 */
const Calendar: React.FC<CalendarProps> = ({
  year,
  month,
  performances,
  onMonthChange,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPerformances, setSelectedPerformances] = useState<CalendarPerformance[]>([]);

  const handlePrevMonth = () => {
    const { year: prevYear, month: prevMonth } = getPrevMonth(year, month);
    onMonthChange(prevYear, prevMonth);
  };

  const handleNextMonth = () => {
    const { year: nextYear, month: nextMonth } = getNextMonth(year, month);
    onMonthChange(nextYear, nextMonth);
  };

  // 해당 날짜의 공연 목록
  const getPerformancesByDate = (date: number): CalendarPerformance[] => {
    const targetDate = new Date(year, month - 1, date);
    targetDate.setHours(0, 0, 0, 0);

    return performances.filter((perf) => {
      // "2026-04-18" 형식의 문자열을 로컬 시간대로 파싱
      const [startYear, startMonth, startDay] = perf.startDate.split('-').map(Number);
      const [endYear, endMonth, endDay] = perf.endDate.split('-').map(Number);

      const startDate = new Date(startYear, startMonth - 1, startDay);
      const endDate = new Date(endYear, endMonth - 1, endDay);

      return targetDate >= startDate && targetDate <= endDate;
    });
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (date: number) => {
    const dayPerformances = getPerformancesByDate(date);
    if (dayPerformances.length === 0) return;

    setSelectedDate(`${year}년 ${month}월 ${date}일`);
    setSelectedPerformances(dayPerformances);
    setIsModalOpen(true);
  };

  // 해당 월의 일수
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const isToday = (date: number) =>
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    date === today.getDate();

  // 캘린더 그리드 생성
  const calendarDays = [];

  // 이전 달 빈 칸
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(
      <div key={`empty-${i}`} className="min-h-[100px] md:min-h-[120px] border border-border/30 bg-bg-elevated/30" />
    );
  }

  // 날짜 셀
  for (let date = 1; date <= daysInMonth; date++) {
    const dayPerformances = getPerformancesByDate(date);
    const isTodayDate = isToday(date);
    const hasPerformances = dayPerformances.length > 0;

    calendarDays.push(
      <div
        key={date}
        onClick={() => handleDateClick(date)}
        className={`
          min-h-[100px] md:min-h-[120px] border border-border/30 p-2 overflow-hidden
          transition-all duration-300
          ${isTodayDate ? 'bg-primary/5 border-primary/30' : 'bg-bg-surface/50'}
          ${hasPerformances ? 'cursor-pointer hover:bg-bg-card/50 hover:border-primary/20' : ''}
        `}
      >
        {/* 날짜 숫자 */}
        <div className={`
          text-sm font-medium mb-1 flex items-center gap-1
          ${isTodayDate ? 'text-primary' : 'text-text-secondary'}
        `}>
          <span className={`
            ${isTodayDate ? 'w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs' : ''}
          `}>
            {date}
          </span>
          {isTodayDate && <span className="text-xs text-primary/60">오늘</span>}
        </div>

        {/* 공연 칩 목록 */}
        <div className="space-y-1">
          {dayPerformances.slice(0, 2).map((perf, idx) => (
            <div
              key={`${perf.id}-${idx}`}
              className="text-[10px] md:text-xs px-2 py-1 rounded-md truncate transition-all duration-300 bg-accent/10 text-accent-light hover:bg-accent/20 border border-accent/20"
              title={perf.title}
            >
              {perf.title}
            </div>
          ))}
          {dayPerformances.length > 2 && (
            <div className="text-[10px] text-text-muted px-2 font-medium">
              +{dayPerformances.length - 2}개
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline text-text-primary">
            {formatYearMonth(year, month)}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-2.5 rounded-xl bg-bg-surface border border-border hover:border-primary/50 hover:bg-bg-card transition-all duration-300"
              aria-label="이전 달"
            >
              <FaChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2.5 rounded-xl bg-bg-surface border border-border hover:border-primary/50 hover:bg-bg-card transition-all duration-300"
              aria-label="다음 달"
            >
              <FaChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
            <div
              key={day}
              className={`
                text-center text-xs font-semibold py-3 border-b border-border/30
                ${idx === 0 ? 'text-accent' : idx === 6 ? 'text-secondary' : 'text-text-muted'}
              `}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 그리드 */}
        <div className="grid grid-cols-7 gap-0 rounded-xl overflow-hidden border border-border/30">
          {calendarDays}
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-end gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-accent/20 border border-accent/30" />
            <span className="text-xs text-text-muted">공연 (클릭하여 전체보기)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-xs text-text-muted">오늘</span>
          </div>
        </div>
      </div>

      {/* 공연 목록 모달 */}
      <PerformanceDayModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate}
        performances={selectedPerformances}
      />
    </>
  );
};

export default Calendar;
