import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CaretLeft, CaretRight } from '@phosphor-icons/react';

const DatePicker = ({ selectedDate, onDateSelect, isOpen, onToggle }) => {
  const [calendarDays, setCalendarDays] = useState([]);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const isSameDay = useCallback((date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }, []);

  const isToday = useCallback((date) => {
    const today = new Date();
    return isSameDay(date, today);
  }, [isSameDay]);

  const generateCalendarDays = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    // First day of the current month
    const firstDay = new Date(year, month, 1);
    
    // Start from the first Sunday of the week containing the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Generate 42 days (6 weeks)
    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const isCurrentMonthDate = date.getMonth() === month;
      const isDisabled = !isCurrentMonthDate;
      
      days.push({
        date: date,
        day: date.getDate(),
        isCurrentMonth: isCurrentMonthDate,
        isToday: isToday(date),
        isSelected: selectedDate && isSameDay(date, selectedDate),
        isDisabled: isDisabled
      });
    }
    
    setCalendarDays(days);
  }, [selectedDate, isToday, isSameDay]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  const handleDateClick = (dayObj) => {
    // Only allow selection of dates in current month
    if (!dayObj.isDisabled) {
      onDateSelect(dayObj.date);
      onToggle(); // Close calendar after selection
    }
  };

  const goToToday = () => {
    const today = new Date();
    onDateSelect(today);
    onToggle();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Calendar size={20} className="text-gray-600" />
        <span className="text-gray-700">
          {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecionar data'}
        </span>
      </button>
    );
  }

  return (
    <div className="relative">
      {/* Calendar Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border border-blue-500 rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
      >
        <Calendar size={20} />
        <span>
          {selectedDate ? selectedDate.toLocaleDateString('pt-BR') : 'Selecionar data'}
        </span>
      </button>

      {/* Calendar Dropdown */}
      <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[320px]">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            className="p-1 bg-gray-100 text-gray-400 rounded transition-colors cursor-not-allowed"
            disabled
            onClick={(e) => e.preventDefault()}
            title="Navegação desabilitada - apenas mês atual"
          >
            <CaretLeft size={20} />
          </button>
          
          <h3 className="font-semibold text-gray-800">
            {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
          </h3>
          
          <button
            className="p-1 bg-gray-100 text-gray-400 rounded transition-colors cursor-not-allowed"
            disabled
            onClick={(e) => e.preventDefault()}
            title="Navegação desabilitada - apenas mês atual"
          >
            <CaretRight size={20} />
          </button>
        </div>

        {/* Day Names Header */}
        <div className="grid grid-cols-7 gap-1 p-2 border-b border-gray-100">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1 p-2">
          {calendarDays.map((dayObj, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(dayObj)}
              disabled={dayObj.isDisabled}
              className={`
                h-10 w-10 text-sm rounded-lg transition-all duration-200
                ${
                  dayObj.isDisabled
                    ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                    : dayObj.isSelected
                    ? 'bg-blue-500 text-white font-semibold shadow-md hover:scale-105'
                    : dayObj.isToday
                    ? 'bg-blue-100 text-blue-700 font-semibold hover:scale-105'
                    : 'text-gray-700 hover:bg-gray-100 hover:scale-105'
                }
              `}
            >
              {dayObj.day}
            </button>
          ))}
        </div>

        {/* Footer with Today Button */}
        <div className="p-3 border-t border-gray-100">
          <button
            onClick={goToToday}
            className="w-full py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ir para hoje
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;