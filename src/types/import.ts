export interface ImportOptions {
  // 카테고리별 선택
  importBottles: boolean;
  importTastings: boolean;
  importWishlist: boolean;
  importBrands: boolean;
  
  // 각 카테고리별 모드
  bottlesMode: 'replace' | 'add' | 'merge';
  tastingsMode: 'replace' | 'add' | 'merge';
  wishlistMode: 'replace' | 'add' | 'merge';
  brandsMode: 'replace' | 'add' | 'merge';
}

export const defaultImportOptions: ImportOptions = {
  importBottles: true,
  importTastings: true,
  importWishlist: true,
  importBrands: true,
  
  bottlesMode: 'add',
  tastingsMode: 'add',
  wishlistMode: 'add',
  brandsMode: 'add'
}; 