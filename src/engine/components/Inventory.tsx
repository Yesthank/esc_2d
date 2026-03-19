import type { Item } from '../types';
import './Inventory.css';

interface Props {
  items: Item[];
  ownedIds: string[];
  selectedItem: string | null;
  onSelectItem: (itemId: string | null) => void;
  onExamine: (itemId: string) => void;
}

export function Inventory({ items, ownedIds, selectedItem, onSelectItem, onExamine }: Props) {
  const ownedItems = items.filter(item => ownedIds.includes(item.id));
  const slots = Array.from({ length: 6 }, (_, i) => ownedItems[i] ?? null);

  return (
    <div className="inventory">
      <div className="inventory__title">소지품</div>
      <div className="inventory__slots">
        {slots.map((item, i) => (
          <div
            key={i}
            className={`inventory__slot ${item ? 'inventory__slot--filled' : ''} ${item && selectedItem === item.id ? 'inventory__slot--selected' : ''}`}
            onClick={() => {
              if (!item) return;
              if (selectedItem === item.id) {
                onSelectItem(null);
              } else {
                onSelectItem(item.id);
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (item) onExamine(item.id);
            }}
            title={item ? `${item.name} (우클릭: 자세히)` : '빈 슬롯'}
          >
            {item && (
              <>
                <div className="inventory__icon">{item.icon}</div>
                <div className="inventory__name">{item.name}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
