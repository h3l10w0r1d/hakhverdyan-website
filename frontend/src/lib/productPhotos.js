// Placeholder photography (Unsplash, free license) standing in for real product shots.
// Grouped by visual similarity rather than one-per-SKU — swap these for real photography before launch.
const WINDOW_PHOTO = "https://images.unsplash.com/photo-1621603312919-a391e73f92ed?w=800&q=70&fm=jpg&fit=crop";
const WINDOW_PHOTO_2 = "https://images.unsplash.com/photo-1569216961559-fd512349ebba?w=800&q=70&fm=jpg&fit=crop";
const HARDWARE_PHOTO = "https://images.unsplash.com/photo-1669278628950-84f711b723fe?w=800&q=70&fm=jpg&fit=crop";
const HARDWARE_PHOTO_2 = "https://images.unsplash.com/photo-1583691028182-e8f01e74bfa2?w=800&q=70&fm=jpg&fit=crop";
const SHEET_PHOTO = "https://images.unsplash.com/photo-1756758932992-3cac25c395f7?w=800&q=70&fm=jpg&fit=crop";
const SHEET_PHOTO_2 = "https://images.unsplash.com/photo-1678794792900-5abfe053682e?w=800&q=70&fm=jpg&fit=crop";
const DOOR_PHOTO = "https://images.unsplash.com/photo-1734360659832-6ec810b0334e?w=800&q=70&fm=jpg&fit=crop";
const DOOR_PHOTO_2 = "https://images.unsplash.com/photo-1544641724-73f0d1bee38b?w=800&q=70&fm=jpg&fit=crop";
const GATE_PHOTO = "https://images.unsplash.com/photo-1785102742384-123dd05c1465?w=800&q=70&fm=jpg&fit=crop";
const GATE_PHOTO_2 = "https://images.unsplash.com/photo-1601835991665-66595682d6c5?w=800&q=70&fm=jpg&fit=crop";
const FACADE_PHOTO = "https://images.unsplash.com/photo-1745015446589-7ee6f702d8c1?w=800&q=70&fm=jpg&fit=crop";
const FACADE_PHOTO_2 = "https://images.unsplash.com/photo-1462396240927-52058a6a84ec?w=800&q=70&fm=jpg&fit=crop";

const PRODUCT_PHOTO_SETS = {
  aluminum: [WINDOW_PHOTO, WINDOW_PHOTO_2],
  "aluminum-angle": [WINDOW_PHOTO, WINDOW_PHOTO_2],
  pvc: [WINDOW_PHOTO, WINDOW_PHOTO_2],
  "pvc-chamber": [WINDOW_PHOTO, WINDOW_PHOTO_2],
  handle: [HARDWARE_PHOTO, HARDWARE_PHOTO_2],
  lock: [HARDWARE_PHOTO, HARDWARE_PHOTO_2],
  layers: [SHEET_PHOTO, SHEET_PHOTO_2],
  sheen: [SHEET_PHOTO, SHEET_PHOTO_2],
  polycarbonate: [SHEET_PHOTO, SHEET_PHOTO_2],
  "door-split": [DOOR_PHOTO, DOOR_PHOTO_2],
  "door-flush": [DOOR_PHOTO, DOOR_PHOTO_2],
  gate: [GATE_PHOTO, GATE_PHOTO_2],
  "gate-insulated": [GATE_PHOTO, GATE_PHOTO_2],
  "facade-grid": [FACADE_PHOTO, FACADE_PHOTO_2],
  "facade-frameless": [FACADE_PHOTO, FACADE_PHOTO_2],
  box: [WINDOW_PHOTO],
};

export function productPhotos(iconKey) {
  return PRODUCT_PHOTO_SETS[iconKey] || PRODUCT_PHOTO_SETS.box;
}

export function productPhoto(iconKey) {
  return productPhotos(iconKey)[0];
}
