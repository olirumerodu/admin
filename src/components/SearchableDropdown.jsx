import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

/**
 * SearchableDropdown
 * A sleek, searchable dropdown selector for filter bars and form controls.
 *
 * Props:
 * - label?: string (e.g., 'Class', 'Section')
 * - value: string (currently selected value)
 * - onChange: (val: string) => void
 * - options: Array<{ value: string, label: string, count?: number, sublabel?: string }> | Array<string>
 * - allOptionLabel?: string (default: 'All')
 * - showAllOption?: boolean (default: true for filter variant, false for form variant)
 * - placeholder?: string (default: 'Select...')
 * - searchPlaceholder?: string (default: 'Search...')
 * - icon?: React component (optional leading icon)
 * - minWidth?: string (default: '145px' for filter, '100%' for form)
 * - disabled?: boolean
 * - style?: React.CSSProperties
 * - variant?: 'filter' | 'form' (default: 'filter')
 * - height?: string (e.g. '42px')
 */
export default function SearchableDropdown({
  label,
  value,
  onChange,
  options = [],
  allOptionLabel = 'All',
  showAllOption = undefined,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  icon: IconComponent = null,
  minWidth = undefined,
  disabled = false,
  style = {},
  variant = 'filter',
  height = undefined
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const optionsListRef = useRef(null);
  const selectedOptRef = useRef(null);

  const isFormVariant = variant === 'form';
  const shouldShowAll = showAllOption !== undefined ? showAllOption : !isFormVariant;

  // Normalize options into standardized object shape: { value, label, count, sublabel }
  const normalizedOptions = useMemo(() => {
    return options.map(opt => {
      if (typeof opt === 'object' && opt !== null) {
        return {
          value: opt.value !== undefined ? String(opt.value) : '',
          label: opt.label !== undefined ? String(opt.label) : String(opt.value || ''),
          count: opt.count !== undefined ? opt.count : null,
          sublabel: opt.sublabel || null
        };
      }
      const strVal = String(opt);
      return {
        value: strVal,
        label: strVal,
        count: null,
        sublabel: null
      };
    });
  }, [options]);

  // Filter options by search query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase().trim();
    return normalizedOptions.filter(opt =>
      opt.label.toLowerCase().includes(q) ||
      opt.value.toLowerCase().includes(q) ||
      (opt.sublabel && opt.sublabel.toLowerCase().includes(q))
    );
  }, [normalizedOptions, searchQuery]);

  // Current display label
  const currentLabel = useMemo(() => {
    if (!value) {
      return shouldShowAll ? allOptionLabel : '';
    }
    if (shouldShowAll && value === allOptionLabel) {
      return allOptionLabel;
    }
    const matched = normalizedOptions.find(opt => opt.value === value || opt.label === value);
    return matched ? matched.label : value;
  }, [value, allOptionLabel, shouldShowAll, normalizedOptions]);

  const isFiltered = Boolean(value && (shouldShowAll ? value !== allOptionLabel : true));

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

  // Auto-focus search input and scroll to selected option when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        // Scroll selected option into view
        if (selectedOptRef.current && optionsListRef.current) {
          selectedOptRef.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
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
    onChange(shouldShowAll ? allOptionLabel : '');
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'relative',
        display: isFormVariant ? 'block' : 'inline-block',
        width: isFormVariant ? '100%' : 'auto',
        minWidth: minWidth || (isFormVariant ? '100%' : '145px'),
        boxSizing: 'border-box',
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
          height: height || (isFormVariant ? '42px' : 'auto'),
          padding: isFormVariant ? '0 12px' : '6.5px 10px',
          borderRadius: '8px',
          border: isOpen
            ? '1.5px solid #EA580C'
            : isFormVariant
            ? (isFiltered ? '1.5px solid #CBD5E1' : '1.5px solid #E2E8F0')
            : isFiltered
            ? '1.5px solid #FED7AA'
            : '1px solid #CBD5E1',
          backgroundColor: isFormVariant ? '#FFFFFF' : isFiltered ? '#FFF7ED' : '#FFFFFF',
          color: isFiltered ? '#0F172A' : (isFormVariant ? '#94A3B8' : '#64748B'),
          fontSize: isFormVariant ? '13px' : '12px',
          fontWeight: isFiltered ? (isFormVariant ? 600 : 700) : (isFormVariant ? 400 : 500),
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'all 0.15s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(234, 88, 12, 0.12)' : 'none'
        }}
        title={`${label || 'Select'}: ${currentLabel || placeholder}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: isFormVariant ? '10px' : '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {IconComponent && (
            <IconComponent
              size={isFormVariant ? 16 : 13}
              color={isOpen ? '#EA580C' : isFiltered ? '#EA580C' : '#64748B'}
              style={{ flexShrink: 0 }}
            />
          )}
          {label && (
            <span style={{ fontSize: isFormVariant ? '12px' : '11px', color: isFiltered ? '#EA580C' : '#64748B', fontWeight: 600 }}>
              {label}:
            </span>
          )}
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: isFiltered ? '#0F172A' : (isFormVariant ? '#94A3B8' : '#64748B'),
            fontWeight: isFiltered ? (isFormVariant ? 600 : 700) : 400
          }}>
            {currentLabel || placeholder}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          {isFiltered && (
            <span
              onClick={handleClear}
              title={`Reset ${label || 'selection'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isFormVariant ? '18px' : '16px',
                height: isFormVariant ? '18px' : '16px',
                borderRadius: '50%',
                backgroundColor: isFormVariant ? '#F1F5F9' : '#FFEDD5',
                color: isFormVariant ? '#64748B' : '#C2410C',
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isFormVariant ? '#E2E8F0' : '#FDBA74';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isFormVariant ? '#F1F5F9' : '#FFEDD5';
                e.currentTarget.style.color = isFormVariant ? '#64748B' : '#C2410C';
              }}
            >
              <X size={isFormVariant ? 11 : 10} strokeWidth={2.5} />
            </span>
          )}
          <ChevronDown
            size={isFormVariant ? 15 : 13}
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
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 9999,
            minWidth: '100%',
            width: isFormVariant ? '100%' : 'max-content',
            maxWidth: isFormVariant ? '100%' : '280px',
            backgroundColor: '#FFFFFF',
            borderRadius: '10px',
            border: '1.5px solid #E2E8F0',
            boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.16), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            animation: 'fadeIn 0.12s ease-out'
          }}
        >
          {/* Search Box Header */}
          <div
            style={{
              padding: isFormVariant ? '9px 12px' : '8px 10px',
              borderBottom: '1px solid #F1F5F9',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Search size={isFormVariant ? 15 : 13} color="#94A3B8" style={{ flexShrink: 0 }} />
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
                fontSize: isFormVariant ? '12.5px' : '11.5px',
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
            ref={optionsListRef}
            style={{
              maxHeight: isFormVariant ? '240px' : '220px',
              overflowY: 'auto',
              padding: '4px'
            }}
          >
            {/* "All" Option at top (if shouldShowAll is true) */}
            {shouldShowAll && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) && (
              <div
                onClick={() => handleSelect(allOptionLabel)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: isFormVariant ? '8px 10px' : '6.5px 10px',
                  borderRadius: '6px',
                  fontSize: isFormVariant ? '12.5px' : '12px',
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
            {shouldShowAll && (!searchQuery || allOptionLabel.toLowerCase().includes(searchQuery.toLowerCase())) &&
              filteredOptions.length > 0 && (
                <div style={{ height: '1px', backgroundColor: '#F1F5F9', margin: '4px 0' }} />
              )}

            {/* Render Filtered Options */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => {
                const isSelected = value === opt.value || value === opt.label;
                return (
                  <div
                    key={`opt-${opt.value}-${idx}`}
                    ref={isSelected ? selectedOptRef : null}
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                      padding: isFormVariant ? '8.5px 10px' : '6.5px 10px',
                      borderRadius: '6px',
                      fontSize: isFormVariant ? '12.5px' : '12px',
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', overflow: 'hidden' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {opt.label}
                      </span>
                      {opt.sublabel && (
                        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 400 }}>
                          {opt.sublabel}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
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
                      {isSelected && <Check size={14} color="#EA580C" strokeWidth={2.5} />}
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: '16px 10px',
                  textAlign: 'center',
                  fontSize: '12px',
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
                      Select "{searchQuery.trim()}"
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
