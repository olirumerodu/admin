import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

/**
 * SearchableDropdown
 * A sleek, searchable dropdown selector for filter bars and form controls.
 *
 * Props:
 * - label: string (e.g., 'Class', 'Section')
 * - value: string (currently selected value)
 * - onChange: (val: string) => void
 * - options: Array<{ value: string, label: string, count?: number }> | Array<string>
 * - allOptionLabel: string (default: 'All Classes' / 'All Sections')
 * - placeholder: string (default: 'Select...')
 * - searchPlaceholder: string (default: 'Search...')
 * - icon: React component (optional leading icon)
 * - minWidth: string (default: '150px')
 * - disabled?: boolean
 */
export default function SearchableDropdown({
  label,
  value,
  onChange,
  options = [],
  allOptionLabel = 'All',
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  icon: IconComponent = null,
  minWidth = '145px',
  disabled = false,
  style = {}
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Normalize options into standardized object shape: { value, label, count }
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? String(opt.value) : '',
          label: opt.label !== undefined ? String(opt.label) : String(opt.value || ''),
          count: opt.count !== undefined ? opt.count : null
        };
      }
      const strVal = String(opt);
      return {
        value: strVal,
        label: strVal,
        count: null
      };
    });
  }, [options]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Current display label
  const currentLabel = useMemo(() => {
    if (!value || value === allOptionLabel) {
      return allOptionLabel;
    }
    const matched = normalizedOptions.find(opt => opt.value === value || opt.label === value);
    return matched ? matched.label : value;
  }, [value, allOptionLabel, normalizedOptions]);

  const isFiltered = value && value !== allOptionLabel;

  // Handle outside click to close
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Auto-focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(allOptionLabel);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        minWidth: minWidth,
        ...style
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6.5px 10px',
          borderRadius: '8px',
          border: isOpen
            ? '1.5px solid #EA580C'
            : isFiltered
            ? '1.5px solid #FED7AA'
            : '1px solid #CBD5E1',
          backgroundColor: isFiltered ? '#FFF7ED' : '#FFFFFF',
          color: isFiltered ? '#C2410C' : '#0F172A',
          fontSize: '12px',
          fontWeight: isFiltered ? 700 : 500,
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(234, 88, 12, 0.12)' : 'none'
        }}
        title={`${label || 'Filter'}: ${currentLabel}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {IconComponent && (
            <IconComponent
              size={13}
              color={isFiltered ? '#EA580C' : '#64748B'}
              style={{ flexShrink: 0 }}
            />
          )}
          {label && (
            <span style={{ fontSize: '11px', color: isFiltered ? '#EA580C' : '#64748B', fontWeight: 600 }}>
              {label}:
            </span>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentLabel || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isFiltered && (
            <span
              onClick={handleClear}
              title={`Reset ${label || 'filter'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: '#FFEDD5',
                color: '#C2410C',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FDBA74')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFEDD5')}
            >
              <X size={10} strokeWidth={2.5} />
            </span>
          )}
          <ChevronDown
            size={13}
            color={isOpen ? '#EA580C' : '#94A3B8'}
            style={{
              transition: 'transform 0.15s ease',
              transform: isOpen ? 'rotate(180deg)' : 'none'
            }}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            zIndex: 9999,
            minWidth: '100%',
            width: 'max-content',
            maxWidth: '280px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1px solid #CBD5E1',
            boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.16), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.12s ease-out'
          }}
        >
          {/* Search Box Header */}
          <div
            style={{
              padding: '8px 10px',
              borderBottom: '1px solid #F1F5F9',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Search size={13} color="#94A3B8" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              style={{
                flex: 1,
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontSize: '11.5px',
                color: '#0F172A',
                padding: '2px 0'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredOptions.length > 0) {
                  e.preventDefault();
                  handleSelect(filteredOptions[0].value);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div
            style={{
              maxHeight: '220px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {/* "All" Option at top (if not searching or if search matches) */}
            {(!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <div
                onClick={() => handleSelect(allOptionLabel)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6.5px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: !isFiltered ? 700 : 500,
                  color: !isFiltered ? '#EA580C' : '#334155',
                  backgroundColor: !isFiltered ? '#FFF7ED' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={(e) => {
                  if (isFiltered) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (isFiltered) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <span>{allOptionLabel}</span>
                {!isFiltered && <Check size={13} color="#EA580C" strokeWidth={2.5} />}
              </div>
            )}

            {/* Separator if "All" is shown */}
            {(!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) &&
              filteredOptions.length > 0 && (
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
              )}

            {/* Render Filtered Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt.value || value === opt.label;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: '6.5px 10px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#EA580C' : '#0F172A',
                      backgroundColor: isSelected ? '#FFF7ED' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.1s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt.label}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {opt.count !== null && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 600,
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: isSelected ? '#FED7AA' : '#F1F5F9',
                            color: isSelected ? '#9A3412' : '#64748B'
                          }}
                        >
                          {opt.count}
                        </span>
                      )}
                      {isSelected && <Check size={13} color="#EA580C" strokeWidth={2.5} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '14px 10px',
                  textAlign: 'center',
                  fontSize: '11.5px',
                  color: '#94A3B8'
                }}
              >
                No matching options
                {searchQuery.trim() && (
                  <div style={{ marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleSelect(searchQuery.trim())}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: '1px solid #FED7AA',
                        backgroundColor: '#FFF7ED',
                        color: '#EA580C',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Filter by "{searchQuery.trim()}"
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
