/**
 * Smart Packing List Service
 * Weather-aware, activity-based packing suggestions with local storage persistence.
 */

export interface PackingItem {
    id: string;
    name: string;
    category: PackingCategory;
    packed: boolean;
    quantity: number;
    essential: boolean;
}

export type PackingCategory = 'Clothing' | 'Toiletries' | 'Electronics' | 'Documents' | 'Medicine' | 'Accessories' | 'Misc';

export interface PackingList {
    id: string;
    name: string;
    destination: string;
    duration: number;
    weather: 'hot' | 'cold' | 'rainy' | 'moderate';
    activities: string[];
    items: PackingItem[];
    createdAt: string;
}

const STORAGE_KEY = 'faio_packing_lists';

const BASE_ESSENTIALS: Omit<PackingItem, 'id' | 'packed'>[] = [
    { name: 'Passport', category: 'Documents', quantity: 1, essential: true },
    { name: 'ID Card (Aadhaar/PAN)', category: 'Documents', quantity: 1, essential: true },
    { name: 'Flight/Train Tickets', category: 'Documents', quantity: 1, essential: true },
    { name: 'Hotel Booking Confirmation', category: 'Documents', quantity: 1, essential: true },
    { name: 'Travel Insurance', category: 'Documents', quantity: 1, essential: true },
    { name: 'Phone Charger', category: 'Electronics', quantity: 1, essential: true },
    { name: 'Power Bank', category: 'Electronics', quantity: 1, essential: true },
    { name: 'Earphones/Headphones', category: 'Electronics', quantity: 1, essential: false },
    { name: 'Toothbrush', category: 'Toiletries', quantity: 1, essential: true },
    { name: 'Toothpaste', category: 'Toiletries', quantity: 1, essential: true },
    { name: 'Deodorant', category: 'Toiletries', quantity: 1, essential: true },
    { name: 'Shampoo', category: 'Toiletries', quantity: 1, essential: false },
    { name: 'Sunscreen', category: 'Toiletries', quantity: 1, essential: false },
    { name: 'Medications', category: 'Medicine', quantity: 1, essential: true },
    { name: 'First Aid Kit', category: 'Medicine', quantity: 1, essential: false },
    { name: 'Hand Sanitizer', category: 'Medicine', quantity: 1, essential: true },
    { name: 'Face Masks', category: 'Medicine', quantity: 5, essential: false },
    { name: 'Underwear', category: 'Clothing', quantity: 3, essential: true },
    { name: 'Socks', category: 'Clothing', quantity: 3, essential: true },
    { name: 'T-Shirts', category: 'Clothing', quantity: 3, essential: true },
    { name: 'Pants/Jeans', category: 'Clothing', quantity: 2, essential: true },
    { name: 'Sleepwear', category: 'Clothing', quantity: 1, essential: false },
    { name: 'Cash & Cards', category: 'Accessories', quantity: 1, essential: true },
    { name: 'Water Bottle', category: 'Accessories', quantity: 1, essential: false },
    { name: 'Backpack/Day Bag', category: 'Accessories', quantity: 1, essential: false },
];

const WEATHER_ITEMS: Record<string, Omit<PackingItem, 'id' | 'packed'>[]> = {
    hot: [
        { name: 'Shorts', category: 'Clothing', quantity: 2, essential: true },
        { name: 'Sunglasses', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Hat/Cap', category: 'Accessories', quantity: 1, essential: false },
        { name: 'Light Cotton Shirts', category: 'Clothing', quantity: 2, essential: true },
        { name: 'Flip Flops/Sandals', category: 'Clothing', quantity: 1, essential: false },
        { name: 'Sunscreen SPF 50+', category: 'Toiletries', quantity: 1, essential: true },
        { name: 'Aloe Vera Gel', category: 'Toiletries', quantity: 1, essential: false },
    ],
    cold: [
        { name: 'Jacket/Coat', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Thermal Innerwear', category: 'Clothing', quantity: 2, essential: true },
        { name: 'Sweater/Hoodie', category: 'Clothing', quantity: 2, essential: true },
        { name: 'Gloves', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Beanie/Woolen Cap', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Scarf/Muffler', category: 'Accessories', quantity: 1, essential: false },
        { name: 'Warm Socks', category: 'Clothing', quantity: 3, essential: true },
        { name: 'Lip Balm', category: 'Toiletries', quantity: 1, essential: false },
    ],
    rainy: [
        { name: 'Rain Jacket/Poncho', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Umbrella', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Waterproof Bag Cover', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Quick-Dry Clothes', category: 'Clothing', quantity: 2, essential: false },
        { name: 'Waterproof Shoes', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Ziplock Bags (for docs)', category: 'Accessories', quantity: 5, essential: false },
    ],
    moderate: [
        { name: 'Light Jacket', category: 'Clothing', quantity: 1, essential: false },
        { name: 'Casual Shoes', category: 'Clothing', quantity: 1, essential: true },
    ],
};

const ACTIVITY_ITEMS: Record<string, Omit<PackingItem, 'id' | 'packed'>[]> = {
    beach: [
        { name: 'Swimwear', category: 'Clothing', quantity: 2, essential: true },
        { name: 'Beach Towel', category: 'Accessories', quantity: 1, essential: true },
        { name: 'Waterproof Phone Pouch', category: 'Electronics', quantity: 1, essential: false },
        { name: 'Snorkel Gear', category: 'Accessories', quantity: 1, essential: false },
    ],
    trekking: [
        { name: 'Hiking Boots', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Trekking Poles', category: 'Accessories', quantity: 1, essential: false },
        { name: 'Torch/Flashlight', category: 'Electronics', quantity: 1, essential: true },
        { name: 'Energy Bars', category: 'Misc', quantity: 5, essential: false },
        { name: 'Insect Repellent', category: 'Toiletries', quantity: 1, essential: true },
    ],
    business: [
        { name: 'Formal Shirts', category: 'Clothing', quantity: 3, essential: true },
        { name: 'Formal Shoes', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Blazer/Suit', category: 'Clothing', quantity: 1, essential: true },
        { name: 'Laptop', category: 'Electronics', quantity: 1, essential: true },
        { name: 'Laptop Charger', category: 'Electronics', quantity: 1, essential: true },
        { name: 'Business Cards', category: 'Documents', quantity: 1, essential: false },
    ],
    photography: [
        { name: 'Camera', category: 'Electronics', quantity: 1, essential: true },
        { name: 'Extra Batteries', category: 'Electronics', quantity: 2, essential: true },
        { name: 'Memory Cards', category: 'Electronics', quantity: 2, essential: true },
        { name: 'Tripod', category: 'Electronics', quantity: 1, essential: false },
    ],
};

let idCounter = 0;
function makeId(): string {
    return `packing-${Date.now()}-${idCounter++}`;
}

export function generatePackingList(
    destination: string,
    duration: number,
    weather: PackingList['weather'],
    activities: string[],
): PackingList {
    const allRaw = [
        ...BASE_ESSENTIALS,
        ...(WEATHER_ITEMS[weather] || []),
        ...activities.flatMap(a => ACTIVITY_ITEMS[a] || []),
    ];

    // Deduplicate by name
    const seen = new Set<string>();
    const items: PackingItem[] = [];
    for (const raw of allRaw) {
        if (seen.has(raw.name)) continue;
        seen.add(raw.name);
        const qty = raw.category === 'Clothing' && !raw.essential ? Math.min(raw.quantity * Math.ceil(duration / 3), 7) : raw.quantity;
        items.push({ ...raw, quantity: qty, id: makeId(), packed: false });
    }

    const list: PackingList = {
        id: `list-${Date.now()}`,
        name: `${destination} Trip`,
        destination,
        duration,
        weather,
        activities,
        items,
        createdAt: new Date().toISOString(),
    };

    saveLists([...loadLists().filter(l => l.id !== list.id), list]);
    return list;
}

export function loadLists(): PackingList[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
}

export function saveLists(lists: PackingList[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function toggleItem(listId: string, itemId: string): PackingList[] {
    const lists = loadLists().map(l => {
        if (l.id !== listId) return l;
        return { ...l, items: l.items.map(i => i.id === itemId ? { ...i, packed: !i.packed } : i) };
    });
    saveLists(lists);
    return lists;
}

export function addCustomItem(listId: string, name: string, category: PackingCategory): PackingList[] {
    const lists = loadLists().map(l => {
        if (l.id !== listId) return l;
        return { ...l, items: [...l.items, { id: makeId(), name, category, packed: false, quantity: 1, essential: false }] };
    });
    saveLists(lists);
    return lists;
}

export function deleteList(listId: string): PackingList[] {
    const lists = loadLists().filter(l => l.id !== listId);
    saveLists(lists);
    return lists;
}

export const CATEGORIES: PackingCategory[] = ['Clothing', 'Toiletries', 'Electronics', 'Documents', 'Medicine', 'Accessories', 'Misc'];
export const CATEGORY_EMOJIS: Record<PackingCategory, string> = {
    Clothing: '👕', Toiletries: '🧴', Electronics: '🔌', Documents: '📄', Medicine: '💊', Accessories: '🎒', Misc: '📦',
};
export const ACTIVITIES = ['beach', 'trekking', 'business', 'photography'];
export const WEATHER_OPTIONS: { value: PackingList['weather']; label: string; emoji: string }[] = [
    { value: 'hot', label: 'Hot', emoji: '☀️' },
    { value: 'cold', label: 'Cold', emoji: '❄️' },
    { value: 'rainy', label: 'Rainy', emoji: '🌧️' },
    { value: 'moderate', label: 'Moderate', emoji: '🌤️' },
];
