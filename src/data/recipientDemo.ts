export type DonationCategory = 'Meals' | 'Bakery' | 'Produce' | 'Dairy';
export type RequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Completed';

export interface Donation {
  id: string;
  name: string;
  description: string;
  category: DonationCategory;
  quantity: number;
  unit: string;
  emoji: string;
  color: string;
  expiresIn: string;
  pickupWindow: string;
  location: string;
  distance: string;
  donor: string;
  donorInitials: string;
  pickupInstructions: string;
  available: boolean;
}

export interface RecipientRequest {
  id: string;
  donationId: string;
  donationName: string;
  quantity: number;
  unit: string;
  status: RequestStatus;
  submitted: string;
  emoji: string;
  color: string;
  note?: string;
}

export const donations: Donation[] = [
  {
    id: '1',
    name: 'Fresh Homemade Lunch',
    description: 'A nourishing, freshly prepared meal with rice, vegetables and lentils.',
    category: 'Meals',
    quantity: 4,
    unit: 'portions',
    emoji: '🍲',
    color: '#FFF0E5',
    expiresIn: 'Expires in 2 hours',
    pickupWindow: 'Today, 12:30 PM – 2:00 PM',
    location: '18 Lake Road, Colombo',
    distance: '0.8 km away',
    donor: 'Amara’s Kitchen',
    donorInitials: 'AK',
    pickupInstructions: 'Please call when you arrive at the front gate.',
    available: true,
  },
  {
    id: '2',
    name: 'Freshly Baked Pastries',
    description: 'A mixed box of croissants and soft rolls baked this morning.',
    category: 'Bakery',
    quantity: 6,
    unit: 'items',
    emoji: '🥐',
    color: '#FFF6DE',
    expiresIn: 'Expires tomorrow',
    pickupWindow: 'Today, 1:00 PM – 5:00 PM',
    location: '42 Park Street, Colombo',
    distance: '1.4 km away',
    donor: 'Daily Crust Bakery',
    donorInitials: 'DC',
    pickupInstructions: 'Collect from the counter and mention MealBridge.',
    available: true,
  },
  {
    id: '3',
    name: 'Seasonal Fruit Box',
    description: 'Fresh bananas, papaya and oranges. Perfect for sharing.',
    category: 'Produce',
    quantity: 3,
    unit: 'boxes',
    emoji: '🍊',
    color: '#FFF0E5',
    expiresIn: 'Expires in 5 hours',
    pickupWindow: 'Today, 2:00 PM – 4:00 PM',
    location: '9 Temple Lane, Colombo',
    distance: '2.1 km away',
    donor: 'Green Basket Market',
    donorInitials: 'GB',
    pickupInstructions: 'Ask for the donation box at the store entrance.',
    available: true,
  },
  {
    id: '4',
    name: 'Warm Vegetable Biryani',
    description: 'Hearty vegetable biryani packed in family-sized containers.',
    category: 'Meals',
    quantity: 5,
    unit: 'portions',
    emoji: '🍛',
    color: '#F4EDFF',
    expiresIn: 'Expires in 8 hours',
    pickupWindow: 'Today, 3:00 PM – 6:00 PM',
    location: '7 Flower Road, Colombo',
    distance: '2.7 km away',
    donor: 'Spice Garden Café',
    donorInitials: 'SG',
    pickupInstructions: 'Use the side entrance on Flower Road.',
    available: true,
  },
  {
    id: '5',
    name: 'Fresh Milk & Yogurt',
    description: 'Chilled dairy products in sealed, unopened containers.',
    category: 'Dairy',
    quantity: 4,
    unit: 'packs',
    emoji: '🥛',
    color: '#EAF5FF',
    expiresIn: 'Expires in 10 hours',
    pickupWindow: 'Today, 12:00 PM – 3:00 PM',
    location: '25 Union Place, Colombo',
    distance: '3.2 km away',
    donor: 'City Grocers',
    donorInitials: 'CG',
    pickupInstructions: 'Please bring a cooler bag if you have one.',
    available: true,
  },
];

export const initialRequests: RecipientRequest[] = [
  {
    id: 'MB-2408',
    donationId: '3',
    donationName: 'Seasonal Fruit Box',
    quantity: 1,
    unit: 'box',
    status: 'Accepted',
    submitted: 'Today, 9:24 AM',
    emoji: '🍊',
    color: '#FFF0E5',
  },
  {
    id: 'MB-2407',
    donationId: '4',
    donationName: 'Warm Vegetable Biryani',
    quantity: 2,
    unit: 'portions',
    status: 'Pending',
    submitted: 'Yesterday, 4:10 PM',
    emoji: '🍛',
    color: '#F4EDFF',
    note: 'Please keep it mild.',
  },
  {
    id: 'MB-2402',
    donationId: '2',
    donationName: 'Freshly Baked Pastries',
    quantity: 2,
    unit: 'items',
    status: 'Completed',
    submitted: 'Oct 8, 11:45 AM',
    emoji: '🥐',
    color: '#FFF6DE',
  },
];
