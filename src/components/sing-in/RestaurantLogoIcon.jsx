import SvgIcon from '@mui/material/SvgIcon';

export function RestaurantLogoIcon(props) {
  return (
    <SvgIcon
      {...props}
      sx={{ width: 140, height: 48, ...props.sx }}
      viewBox="0 0 140 48"
    >
      {/* Главный фон */}
      <rect x="0" y="8" width="140" height="32" rx="16" fill="#D32F2F" />
      
      {/* Бордюрная линия */}
      <rect x="6" y="11" width="128" height="26" rx="13" fill="none" stroke="#FFD54F" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
      
      {/* Вилка (левая часть) — уменьшена */}
      <g transform="translate(14, 14) scale(0.9)" fill="none" stroke="#FFF8E7" strokeWidth="2" strokeLinecap="round">
        <path d="M0 18 L0 7 M0 7 L-3 3 M0 7 L3 3 M0 12 L-2 10 M0 12 L2 10" />
        <path d="M5 18 L5 11 L8 7 M5 12 L7 10" />
        <line x1="-4" y1="18" x2="9" y2="18" strokeWidth="1.8" />
      </g>
      
      {/* Тарелка с едой (центр) — чуть уменьшена */}
      <g transform="translate(56, 12)">
        <ellipse cx="14" cy="16" rx="13" ry="7" fill="#FFF8E7" stroke="#FFD54F" strokeWidth="1" />
        <ellipse cx="14" cy="14" rx="9" ry="4.5" fill="#FFB74D" />
        <circle cx="12" cy="13.5" r="1.8" fill="#FF5722" />
        <circle cx="17" cy="14" r="1.3" fill="#4CAF50" />
        <circle cx="14" cy="12.5" r="0.9" fill="#FFEB3B" />
        {/* Пар от еды */}
        <path d="M8 10 Q10 7 8 4" stroke="#FFF8E7" strokeWidth="1" fill="none" opacity="0.8" strokeLinecap="round" />
        <path d="M14 9 Q16 6 14 3" stroke="#FFF8E7" strokeWidth="1" fill="none" opacity="0.6" strokeLinecap="round" />
        <path d="M20 10 Q22 7 20 4" stroke="#FFF8E7" strokeWidth="1" fill="none" opacity="0.8" strokeLinecap="round" />
      </g>
      
      {/* Звезда шеф-повара — уменьшена и смещена */}
      <g transform="translate(92, 14) scale(0.85)">
        <path d="M16 4 L18.5 9 L24 9.8 L20 13.5 L21 19 L16 16.5 L11 19 L12 13.5 L8 9.8 L13.5 9 Z" fill="#FFD54F" stroke="#FFF8E7" strokeWidth="0.8" />
        <circle cx="16" cy="9" r="2.5" fill="none" stroke="#FFF8E7" strokeWidth="1.2" />
      </g>
      
      {/* Поварской колпак — уменьшен и не вылезает за границы */}
      <g transform="translate(112, 14) scale(0.85)" fill="#FFF8E7">
        <rect x="4" y="18" width="16" height="4" rx="1" />
        <ellipse cx="12" cy="14" rx="9" ry="7" fill="#FFF8E7" />
        <ellipse cx="12" cy="12" rx="5.5" ry="4.5" fill="#F5F5F5" />
        <path d="M8 10 Q10 7 12 8.5 Q14 7 16 10" stroke="#D32F2F" strokeWidth="1" fill="none" />
      </g>
    </SvgIcon>
  );
}