import React, { useState, useEffect } from 'react';
import menuService from '../services/menuService';

const MonthlyRotationCalendar = () => {
  const [monthlyRotation, setMonthlyRotation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  useEffect(() => {
    fetchMonthlyRotation();
  }, [currentMonth, currentYear]);

  const fetchMonthlyRotation = async () => {
    try {
      setLoading(true);
      const response = await menuService.getMonthlyRotation();
      setMonthlyRotation(response.monthlyRotation || {});
    } catch (err) {
      console.error('Error fetching monthly rotation:', err);
      setError('Erro ao carregar rotação mensal');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const today = new Date();
    const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;
    const todayDate = today.getDate();

    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-600"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayData = monthlyRotation[dayKey];
      const isToday = isCurrentMonth && day === todayDate;
      const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
      const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

      days.push(
        <div
          key={day}
          className={`h-24 border border-gray-200 dark:border-gray-600 p-1 relative overflow-hidden ${
            isToday ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500' : 'bg-white dark:bg-slate-800'
          } hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors`}
        >
          <div className={`text-sm font-semibold ${
            isToday ? 'text-yellow-800 dark:text-yellow-200' : 'text-gray-700 dark:text-gray-300'
          }`}>
            {day}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {dayNames[dayOfWeek].substring(0, 3)}
          </div>
          {dayData && (
            <div className="text-xs text-gray-600 dark:text-gray-300 leading-tight">
              <div className="font-medium truncate" title={dayData.nome}>
                {dayData.nome}
              </div>
              <div className="text-green-600 dark:text-green-400 font-semibold">
                R$ {dayData.preco?.toFixed(2)}
              </div>
            </div>
          )}
          {isToday && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full"></div>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded mb-4"></div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-600 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button
            onClick={fetchMonthlyRotation}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeMonth('prev')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        
        <button
          onClick={() => changeMonth('next')}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Hoje</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Prato Especial</span>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRotationCalendar;