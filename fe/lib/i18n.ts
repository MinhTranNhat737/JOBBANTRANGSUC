'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'vi' | 'en'

type I18nStore = {
  lang: Language
  setLang: (lang: Language) => void
  toggleLang: () => void
}

export const useLanguage = create<I18nStore>()(
  persist(
    (set) => ({
      lang: 'vi',
      setLang: (lang) => set({ lang }),
      toggleLang: () => set((state) => ({ lang: state.lang === 'vi' ? 'en' : 'vi' })),
    }),
    {
      name: 'legend-language',
    },
  ),
)

export const TRANSLATIONS = {
  vi: {
    nav: {
      menu: 'MENU',
      newIn: 'NEW IN',
      about: 'ABOUT',
    },
    announcement: [
      'Bảo hành trọn đời',
      'Miễn phí vận chuyển từ 2.000.000₫',
      'Bạc 925 chuẩn kiểm định',
      'Chế tác thủ công tinh xảo',
      'Tặng kèm hộp quà & khăn lau bạc',
    ],
    megaMenu: {
      highlights: {
        title: 'KHÁM PHÁ',
        items: [
          { href: '/collections', label: 'TẤT CẢ SẢN PHẨM' },
          { href: '/collections?badge=New', label: 'MỚI NHẤT (LATEST)' },
          { href: '/collections?badge=Best+seller', label: 'BÁN CHẠY NHẤT' },
          { href: '/collections?c=rings', label: 'BỘ SƯU TẬP TỨ LINH' },
          { href: '/collections', label: 'GỢI Ý CHO NGƯỜI MỚI' },
        ],
      },
      jewelry: {
        title: 'TRANG SỨC BẠC',
        items: [
          { href: '/collections?c=rings', label: 'NHẪN BẠC 925' },
          { href: '/collections?c=pendants', label: 'MẶT DÂY CHUYỀN' },
          { href: '/collections?c=bracelets', label: 'VÒNG & LẮC TAY' },
          { href: '/collections?c=earrings', label: 'KHUYÊN TAI BẠC' },
          { href: '/collections?c=accessories', label: 'PHỤ KIỆN BẠC THỦ CÔNG' },
        ],
      },
      services: {
        title: 'DỊCH VỤ & CHẾ TÁC',
        items: [
          { href: '/about', label: 'BẢO HÀNH ĐÁNH BÓNG TRỌN ĐỜI' },
          { href: '/about', label: 'BẠC 925 CHUẨN KIỂM ĐỊNH' },
          { href: '/about', label: 'HƯỚNG DẪN ĐO SIZE NHẪN' },
          { href: '/about', label: 'CÂU CHUYỆN NGHỆ NHÂN' },
        ],
      },
      cards: [
        {
          title: 'EXPLORE THE MAKING',
          subtitle: 'Quy trình chế tác thủ công tinh xảo',
          href: '/about',
          btnText: 'Khám phá',
          image: '/images/hero.png',
        },
        {
          title: 'BỘ SƯU TẬP TỨ LINH',
          subtitle: 'Long - Lân - Quy - Phụng hộ mệnh',
          href: '/collections',
          btnText: 'Xem ngay',
          image: '/images/trong-dong.png',
        },
      ],
    },
    header: {
      search: 'Tìm kiếm',
      account: 'Tài khoản',
      wishlist: 'Yêu thích',
      cart: 'Giỏ hàng',
      brandSubtitle: 'Bạc thủ công',
    },
    hero: {
      title: 'Rèn từ huyền thoại',
      subtitle: 'Trang sức bạc 925 chế tác thủ công tinh xảo.',
      cta: 'Khám phá bộ sưu tập',
    },
    home: {
      featuredTitle: 'Tác phẩm nổi bật',
      viewAll: 'Xem tất cả',
      motifs: ['Long', 'Lân', 'Quy', 'Phụng', 'Bạch Liên', 'Trống Đồng'],
      tiles: {
        newIn: 'Mới nhất',
        earrings: 'Khuyên tai',
        rings: 'Nhẫn bạc',
        pendants: 'Mặt dây',
        bracelets: 'Vòng tay',
        all: 'Tất cả tác phẩm',
      },
    },
    newsletter: {
      title: 'Gia nhập dòng truyền thừa',
      subtitle: 'Nhận thông tin sớm nhất về các đợt phát hành tác phẩm giới hạn.',
      placeholder: 'Nhập địa chỉ email của bạn',
      btn: 'Đăng ký',
      success: 'Cảm ơn bạn đã đăng ký!',
    },
    cart: {
      title: 'Giỏ hàng của bạn',
      empty: 'Giỏ hàng của bạn đang trống',
      subtotal: 'Tạm tính',
      shippingNote: 'Phí vận chuyển và ưu đãi được tính khi thanh toán',
      checkout: 'Tiến hành đặt hàng',
      continue: 'Tiếp tục mua sắm',
      size: 'Size',
      remove: 'Xóa',
      total: 'Tổng cộng',
    },
    footer: {
      tagline: 'Trang sức bạc 925 chế tác thủ công tinh xảo lấy cảm hứng từ biểu tượng truyền thống.',
      explore: 'Khám phá',
      collections: 'Bộ sưu tập',
      story: 'Câu chuyện',
      sizing: 'Hướng dẫn đo size',
      support: 'Hỗ trợ khách hàng',
      warranty: 'Chính sách bảo hành trọn đời',
      shipping: 'Chính sách vận chuyển & đổi trả',
      contact: 'Liên hệ nghệ nhân',
      certified: 'Bạc 925 chuẩn kiểm định quốc tế',
      copyright: '© 2026 THUC LUXURY. Bảo lưu mọi quyền.',
    },
    catalog: {
      title: 'Bộ sưu tập trang sức',
      subtitle: 'Tất cả tác phẩm bạc 925 chế tác thủ công',
      filterAll: 'Tất cả',
      filterRings: 'Nhẫn',
      filterPendants: 'Mặt dây',
      filterBracelets: 'Vòng tay',
      filterEarrings: 'Khuyên tai',
      filterAccessories: 'Phụ kiện',
      sortBy: 'Sắp xếp theo',
      priceAsc: 'Giá: Thấp đến Cao',
      priceDesc: 'Giá: Cao đến Thấp',
      newest: 'Mới nhất',
      inStock: 'Còn hàng',
      addToCart: 'Thêm vào giỏ',
    },
    product: {
      addToCart: 'Thêm vào giỏ hàng',
      selectSize: 'Chọn size nhẫn',
      material: 'Chất liệu',
      specifications: 'Chi tiết chế tác',
      warrantyTitle: 'Bảo hành & Cam kết',
      warrantyDesc: 'Bảo hành đánh bóng trọn đời. Bạc 925 chuẩn kiểm định.',
      freeShipping: 'Miễn phí vận chuyển toàn quốc cho đơn từ 2.000.000₫',
    },
  },
  en: {
    nav: {
      menu: 'MENU',
      newIn: 'NEW IN',
      about: 'ABOUT',
    },
    announcement: [
      'Lifetime Warranty',
      'Free Shipping from 2,000,000₫',
      'Certified 925 Sterling Silver',
      'Handcrafted Artistry',
      'Complimentary Gift Box & Polishing Cloth',
    ],
    megaMenu: {
      highlights: {
        title: 'EXPLORE',
        items: [
          { href: '/collections', label: 'ALL PRODUCTS' },
          { href: '/collections?badge=New', label: 'NEW IN (LATEST)' },
          { href: '/collections?badge=Best+seller', label: 'BEST SELLERS' },
          { href: '/collections?c=rings', label: 'FOUR MYTHIC GUARDIANS' },
          { href: '/collections', label: 'NEWBIE PICKS' },
        ],
      },
      jewelry: {
        title: 'SILVER JEWELRY',
        items: [
          { href: '/collections?c=rings', label: 'SILVER RINGS' },
          { href: '/collections?c=pendants', label: 'PENDANTS & NECKLACES' },
          { href: '/collections?c=bracelets', label: 'BRACELETS & CUFFS' },
          { href: '/collections?c=earrings', label: 'SILVER EARRINGS' },
          { href: '/collections?c=accessories', label: 'HANDCRAFTED ACCESSORIES' },
        ],
      },
      services: {
        title: 'SERVICES & CRAFT',
        items: [
          { href: '/about', label: 'LIFETIME POLISHING WARRANTY' },
          { href: '/about', label: 'CERTIFIED 925 SILVER' },
          { href: '/about', label: 'RING SIZE GUIDE' },
          { href: '/about', label: 'ARTISAN STORY' },
        ],
      },
      cards: [
        {
          title: 'EXPLORE THE MAKING',
          subtitle: 'Handcrafted masterwork in solid silver',
          href: '/about',
          btnText: 'Discover',
          image: '/images/hero.png',
        },
        {
          title: 'FOUR SACRED CREATURES',
          subtitle: 'Dragon - Qilin - Turtle - Phoenix talisman',
          href: '/collections',
          btnText: 'Explore now',
          image: '/images/trong-dong.png',
        },
      ],
    },
    header: {
      search: 'Search',
      account: 'Account',
      wishlist: 'Wishlist',
      cart: 'Cart',
      brandSubtitle: 'Handcrafted Silver',
    },
    hero: {
      title: 'Forged from Legend',
      subtitle: 'Fine handcrafted 925 sterling silver jewelry.',
      cta: 'Explore Collection',
    },
    home: {
      featuredTitle: 'Featured Creations',
      viewAll: 'View All',
      motifs: ['Dragon', 'Qilin', 'Tortoise', 'Phoenix', 'White Lotus', 'Bronze Drum'],
      tiles: {
        newIn: 'New In',
        earrings: 'Earrings',
        rings: 'Silver Rings',
        pendants: 'Pendants',
        bracelets: 'Bracelets',
        all: 'All Works',
      },
    },
    newsletter: {
      title: 'Join the Guild of Silver',
      subtitle: 'Be the first to receive updates on limited artisan drops.',
      placeholder: 'Enter your email address',
      btn: 'Subscribe',
      success: 'Thank you for subscribing!',
    },
    cart: {
      title: 'Your Cart',
      empty: 'Your cart is empty',
      subtotal: 'Subtotal',
      shippingNote: 'Shipping and discounts calculated at checkout',
      checkout: 'Proceed to Checkout',
      continue: 'Continue Shopping',
      size: 'Size',
      remove: 'Remove',
      total: 'Total',
    },
    footer: {
      tagline: 'Handcrafted 925 sterling silver jewelry inspired by legendary traditional heritage.',
      explore: 'Explore',
      collections: 'Collections',
      story: 'Story',
      sizing: 'Ring Size Guide',
      support: 'Customer Care',
      warranty: 'Lifetime Warranty Policy',
      shipping: 'Shipping & Return Policy',
      contact: 'Contact & Atelier',
      certified: 'International Standard 925 Silver',
      copyright: '© 2026 THUC LUXURY. All rights reserved.',
    },
    catalog: {
      title: 'Jewelry Collection',
      subtitle: 'All handcrafted 925 sterling silver works',
      filterAll: 'All',
      filterRings: 'Rings',
      filterPendants: 'Pendants',
      filterBracelets: 'Bracelets',
      filterEarrings: 'Earrings',
      filterAccessories: 'Accessories',
      sortBy: 'Sort by',
      priceAsc: 'Price: Low to High',
      priceDesc: 'Price: High to Low',
      newest: 'Newest',
      inStock: 'In Stock',
      addToCart: 'Add to Cart',
    },
    product: {
      addToCart: 'Add to Cart',
      selectSize: 'Select Ring Size',
      material: 'Material',
      specifications: 'Craftsmanship Details',
      warrantyTitle: 'Warranty & Guarantee',
      warrantyDesc: 'Lifetime polishing warranty. Certified 925 Sterling Silver.',
      freeShipping: 'Complimentary shipping on orders over 2,000,000₫',
    },
  },
} as const
