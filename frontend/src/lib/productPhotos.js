// Placeholder photography (Unsplash, free license) standing in for real product shots.
// Grouped by visual similarity rather than one-per-SKU — swap these for real photography before launch.
const WINDOW_PHOTO = "https://images.unsplash.com/photo-1621603312919-a391e73f92ed?w=800&q=70&fm=jpg&fit=crop";
const HARDWARE_PHOTO = "https://images.unsplash.com/photo-1669278628950-84f711b723fe?w=800&q=70&fm=jpg&fit=crop";
const SHEET_PHOTO = "https://images.unsplash.com/photo-1756758932992-3cac25c395f7?w=800&q=70&fm=jpg&fit=crop";
const DOOR_PHOTO = "https://images.unsplash.com/photo-1734360659832-6ec810b0334e?w=800&q=70&fm=jpg&fit=crop";
const GATE_PHOTO = "https://images.unsplash.com/photo-1785102742384-123dd05c1465?w=800&q=70&fm=jpg&fit=crop";
const FACADE_PHOTO = "https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?w=800&q=70&fm=jpg&fit=crop";

const PRODUCT_PHOTOS = {
  aluminum: WINDOW_PHOTO,
  "aluminum-angle": WINDOW_PHOTO,
  pvc: WINDOW_PHOTO,
  "pvc-chamber": WINDOW_PHOTO,
  handle: HARDWARE_PHOTO,
  lock: HARDWARE_PHOTO,
  layers: SHEET_PHOTO,
  sheen: SHEET_PHOTO,
  polycarbonate: SHEET_PHOTO,
  "door-split": DOOR_PHOTO,
  "door-flush": DOOR_PHOTO,
  gate: GATE_PHOTO,
  "gate-insulated": GATE_PHOTO,
  "facade-grid": FACADE_PHOTO,
  "facade-frameless": FACADE_PHOTO,
  box: WINDOW_PHOTO,
};

export function productPhoto(iconKey) {
  return PRODUCT_PHOTOS[iconKey] || PRODUCT_PHOTOS.box;
}
