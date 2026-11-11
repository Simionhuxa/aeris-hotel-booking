import assets from './assets.json';

export type RoomId = 'forest-suite' | 'panorama-loft' | 'summit-residence';
export interface Room { id: RoomId; name: string; capacity: number; area: number; price: number; tagline: string; description: string; features: string; photos: string[] }
const suite = assets['3:16501'];
const listing = assets['3:16209'];

export const rooms: Room[] = [
  { id: 'forest-suite', name: 'Forest Suite', capacity: 2, area: 38, price: 185, tagline: 'Held by the forest.', description: 'A cocoon of warm oak and soft linen. Beyond the glass, a living wall of fir trees. Inside, a considered sanctuary for unhurried mornings.', features: 'King bed · Rain shower · Forest terrace', photos: [listing.imgEditorialPhotograph, suite.imgEditorialPhotograph, suite.imgEditorialPhotograph1, suite.imgEditorialPhotograph2, suite.imgEditorialPhotograph4].filter(Boolean) },
  { id: 'panorama-loft', name: 'Panorama Loft', capacity: 2, area: 52, price: 275, tagline: 'A little closer to the sky.', description: 'Light travels slowly across the timber ceiling. An open-plan loft with generous living space and a panorama that changes with every cloud.', features: 'King bed · Soaking tub · Panoramic balcony', photos: [listing.imgEditorialPhotograph1] },
  { id: 'summit-residence', name: 'Summit Residence', capacity: 4, area: 86, price: 420, tagline: 'Space to be together.', description: 'Two bedrooms, one remarkable view. Gather by the stone fireplace, share a slow breakfast, and make a little home above the valley.', features: 'Two bedrooms · Living room · Private terrace', photos: [listing.imgEditorialPhotograph2] },
];
export const getRoom = (id: string): Room => rooms.find(room => room.id === id) ?? rooms[0];
export const usd = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
