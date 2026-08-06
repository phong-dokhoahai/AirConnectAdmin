import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LanguageCode = "en" | "vi";

type Vars = Record<string, string | number>;
type Dictionary = Record<string, string>;

const storageKey = "airconnect.admin.language";
const defaultLanguage: LanguageCode = "en";

export const languageOptions: { code: LanguageCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
];

const en: Dictionary = {
  "auth.adminAccessBody": "Sign in with an AirConnect admin account to continue.",
  "auth.adminAccessTitle": "This account does not have admin access.",
  "auth.backDashboard": "Back to dashboard",
  "auth.checkingSession": "Loading admin session...",
  "auth.keepLoggedIn": "Keep me logged in",
  "auth.password": "Password",
  "auth.passwordPlaceholder": "Enter your password",
  "auth.signIn": "Sign in",
  "auth.signInBody": "Sign in with your admin account.",
  "auth.signInTitle": "Sign In",
  "auth.signingIn": "Signing in...",
  "common.activate": "Activate",
  "common.active": "Active",
  "common.allStatuses": "All statuses",
  "common.amount": "Amount",
  "common.apply": "Apply",
  "common.backHome": "Back to Home Page",
  "common.cancel": "Cancel",
  "common.clearFilters": "Clear filters",
  "common.coverage": "Coverage",
  "common.customer": "Customer",
  "common.dashboard": "Dashboard",
  "common.data": "Data",
  "common.date": "Date",
  "common.days": "days",
  "common.edit": "Edit",
  "common.email": "Email",
  "common.endDate": "End date",
  "common.error": "ERROR",
  "common.hide": "Hide",
  "common.hidden": "Hidden",
  "common.home": "Home",
  "common.language": "Language",
  "common.loading": "Loading...",
  "common.next": "Next",
  "common.noneSelected": "None selected",
  "common.order": "Order",
  "common.orders": "Orders",
  "common.paymentStatus": "Payment status",
  "common.plan": "Plan",
  "common.previous": "Previous",
  "common.revenue": "Revenue",
  "common.search": "Search",
  "common.startDate": "Start date",
  "common.status": "Status",
  "common.unlimited": "Unlimited",
  "common.validity": "Validity",
  "dashboard.allTimePaidRevenue": "All-time paid revenue",
  "dashboard.description": "Paid revenue, recent orders, and top-selling plans.",
  "dashboard.monthRevenue": "Month revenue",
  "dashboard.noPaidOrders": "No paid orders yet.",
  "dashboard.paidOrdersDefault": "Default revenue-counting orders",
  "dashboard.paidOrdersCount": "{{count}} paid orders",
  "dashboard.paidOrdersOnly": "Paid orders only",
  "dashboard.paidOrdersThisMonth": "Paid orders this month",
  "dashboard.paidOrdersToday": "Paid orders today",
  "dashboard.revenueTrend": "Revenue trend",
  "dashboard.recentOrders": "Recent orders",
  "dashboard.todayRevenue": "Today revenue",
  "dashboard.topPlans": "Top plans",
  "error.dashboard": "Could not load dashboard.",
  "error.orders": "Could not load orders.",
  "error.plan": "Could not load plan.",
  "error.plans": "Could not load plans.",
  "error.revenue": "Could not load revenue.",
  "error.savePlan": "Could not save plan.",
  "error.hidePlan": "Could not hide plan.",
  "error.activatePlan": "Could not activate plan.",
  "header.notifications": "Notification",
  "header.notificationAction": "requests permission to change",
  "header.project": "Project",
  "header.search": "Search or type command...",
  "header.signOut": "Sign out",
  "header.toggleSidebar": "Toggle Sidebar",
  "header.viewAllNotifications": "View All Notifications",
  "notFound.body": "We can't seem to find the page you are looking for!",
  "orders.counted": "Counts toward revenue",
  "orders.emailOrId": "Email or order ID",
  "orders.noMatch": "No orders match these filters.",
  "orders.notCounted": "Not counted",
  "orders.pagination": "Showing {{from}}-{{to}} of {{total}}",
  "orders.count": "{{count}} orders",
  "orders.searchPreserved": "Search value and filters are preserved.",
  "plans.activeCatalog": "Active in customer catalog",
  "plans.actions": "Actions",
  "plans.activationPolicy": "Activation policy",
  "plans.activationPolicyRequired": "Activation policy is required.",
  "plans.availability": "Availability",
  "plans.basics": "Basics",
  "plans.coverage": "Coverage",
  "plans.create": "Create plan",
  "plans.createTitle": "Create Plan",
  "plans.countries": "Countries",
  "plans.currency": "Currency",
  "plans.currencyRequired": "Currency must be uppercase.",
  "plans.dataAmount": "Data amount GB",
  "plans.dataRequired": "Data amount must be greater than 0.",
  "plans.description": "Description",
  "plans.editTitle": "Edit eSIM Plan",
  "plans.features": "Features",
  "plans.featuresHint": "One label per line.",
  "plans.hideConfirmBody":
    "{{title}} will no longer appear in the customer catalog. Existing orders and eSIM history will remain intact.",
  "plans.hideConfirmTitle": "Hide this plan from customers?",
  "plans.hideSaving": "Hiding...",
  "plans.hideSubmit": "Hide plan",
  "plans.networks": "Networks",
  "plans.networksHint": "One per line: ISO2 | Network name | 4G/5G/LTE | Optional note",
  "plans.networksInvalid": "Networks must use: ISO2 | Network name | 4G/5G/LTE | Optional note",
  "plans.newCountries": "New countries",
  "plans.newCountriesHint": "One per line: ISO2 | Country name",
  "plans.newCountriesInvalid": "New countries must use: ISO2 | Country name",
  "plans.noCoverage": "No coverage",
  "plans.noMatch": "No plans match these filters.",
  "plans.noPlans": "No plans yet.",
  "plans.price": "Price",
  "plans.priceRequired": "Price must be 0 or greater.",
  "plans.pricing": "Pricing",
  "plans.provider": "Provider",
  "plans.providerRequired": "Provider is required.",
  "plans.regions": "Regions",
  "plans.save": "Save plan",
  "plans.saved": "Plan saved.",
  "plans.saving": "Saving...",
  "plans.search": "Search plans",
  "plans.support5g": "5G supported",
  "plans.tethering": "Tethering supported",
  "plans.title": "eSIM Plans",
  "plans.titleRequired": "Title is required.",
  "plans.unlimitedData": "Unlimited data",
  "plans.unlimitedNoAmount": "Unlimited plans should not include a data amount.",
  "plans.validityDays": "Validity days",
  "plans.validityRequired": "Validity must be greater than 0.",
  "revenue.byCoverage": "Revenue by coverage",
  "revenue.byDay": "Revenue by day",
  "revenue.byPlan": "Revenue by plan",
  "revenue.byStatus": "Revenue by status",
  "revenue.chartSeries": "Revenue",
  "revenue.defaultHint":
    "Revenue defaults to paid orders. Other statuses are included only when checked.",
  "revenue.dateRange": "{{start}} to {{end}}",
  "revenue.filtered": "Filtered revenue",
  "revenue.includedStatuses": "Included statuses",
  "revenue.noCoverage": "No coverage contribution for this range.",
  "revenue.noOrdersRange": "No orders in this date range.",
  "revenue.noRange": "No revenue in this date range.",
  "revenue.paidDefault": "Revenue-counting by default",
  "sidebar.manage": "Manage AirConnect plans, revenue, and orders.",
  "sidebar.menu": "Menu",
  "status.canceled": "Canceled",
  "status.failed": "Failed",
  "status.paid": "Paid",
  "status.pending": "Pending",
};

const vi: Dictionary = {
  "auth.adminAccessBody": "Đăng nhập bằng tài khoản quản trị AirConnect để tiếp tục.",
  "auth.adminAccessTitle": "Tài khoản này không có quyền quản trị.",
  "auth.backDashboard": "Quay lại bảng điều khiển",
  "auth.checkingSession": "Đang tải phiên quản trị...",
  "auth.keepLoggedIn": "Giữ trạng thái đăng nhập",
  "auth.password": "Mật khẩu",
  "auth.passwordPlaceholder": "Nhập mật khẩu",
  "auth.signIn": "Đăng nhập",
  "auth.signInBody": "Đăng nhập bằng tài khoản quản trị của bạn.",
  "auth.signInTitle": "Đăng nhập",
  "auth.signingIn": "Đang đăng nhập...",
  "common.activate": "Kích hoạt",
  "common.active": "Đang hoạt động",
  "common.allStatuses": "Tất cả trạng thái",
  "common.amount": "Số tiền",
  "common.apply": "Áp dụng",
  "common.backHome": "Về trang chủ",
  "common.cancel": "Hủy",
  "common.clearFilters": "Xóa bộ lọc",
  "common.coverage": "Vùng phủ",
  "common.customer": "Khách hàng",
  "common.dashboard": "Bảng điều khiển",
  "common.data": "Dung lượng",
  "common.date": "Ngày",
  "common.days": "ngày",
  "common.edit": "Sửa",
  "common.email": "Email",
  "common.endDate": "Ngày kết thúc",
  "common.error": "LỖI",
  "common.hide": "Ẩn",
  "common.hidden": "Đã ẩn",
  "common.home": "Trang chủ",
  "common.language": "Ngôn ngữ",
  "common.loading": "Đang tải...",
  "common.next": "Sau",
  "common.noneSelected": "Chưa chọn",
  "common.order": "Đơn hàng",
  "common.orders": "Đơn hàng",
  "common.paymentStatus": "Trạng thái thanh toán",
  "common.plan": "Gói",
  "common.previous": "Trước",
  "common.revenue": "Doanh thu",
  "common.search": "Tìm kiếm",
  "common.startDate": "Ngày bắt đầu",
  "common.status": "Trạng thái",
  "common.unlimited": "Không giới hạn",
  "common.validity": "Hiệu lực",
  "dashboard.allTimePaidRevenue": "Tổng doanh thu đã thanh toán",
  "dashboard.description": "Doanh thu đã thanh toán, đơn gần đây và các gói bán chạy.",
  "dashboard.monthRevenue": "Doanh thu tháng",
  "dashboard.noPaidOrders": "Chưa có đơn đã thanh toán.",
  "dashboard.paidOrdersDefault": "Đơn mặc định được tính doanh thu",
  "dashboard.paidOrdersCount": "{{count}} đơn đã thanh toán",
  "dashboard.paidOrdersOnly": "Chỉ đơn đã thanh toán",
  "dashboard.paidOrdersThisMonth": "Đơn đã thanh toán trong tháng",
  "dashboard.paidOrdersToday": "Đơn đã thanh toán hôm nay",
  "dashboard.revenueTrend": "Xu hướng doanh thu",
  "dashboard.recentOrders": "Đơn hàng gần đây",
  "dashboard.todayRevenue": "Doanh thu hôm nay",
  "dashboard.topPlans": "Gói bán chạy",
  "error.dashboard": "Không thể tải bảng điều khiển.",
  "error.orders": "Không thể tải đơn hàng.",
  "error.plan": "Không thể tải gói.",
  "error.plans": "Không thể tải danh sách gói.",
  "error.revenue": "Không thể tải doanh thu.",
  "error.savePlan": "Không thể lưu gói.",
  "error.hidePlan": "Không thể ẩn gói.",
  "error.activatePlan": "Không thể kích hoạt gói.",
  "header.notifications": "Thông báo",
  "header.notificationAction": "yêu cầu quyền thay đổi",
  "header.project": "Dự án",
  "header.search": "Tìm kiếm hoặc nhập lệnh...",
  "header.signOut": "Đăng xuất",
  "header.toggleSidebar": "Mở/đóng thanh bên",
  "header.viewAllNotifications": "Xem tất cả thông báo",
  "notFound.body": "Không tìm thấy trang bạn đang cần.",
  "orders.counted": "Được tính vào doanh thu",
  "orders.emailOrId": "Email hoặc mã đơn hàng",
  "orders.noMatch": "Không có đơn hàng khớp bộ lọc.",
  "orders.notCounted": "Không tính",
  "orders.pagination": "Hiển thị {{from}}-{{to}} trên {{total}}",
  "orders.count": "{{count}} đơn hàng",
  "orders.searchPreserved": "Giá trị tìm kiếm và bộ lọc được giữ nguyên.",
  "plans.activeCatalog": "Hiển thị trong catalog khách hàng",
  "plans.actions": "Thao tác",
  "plans.activationPolicy": "Chính sách kích hoạt",
  "plans.activationPolicyRequired": "Chính sách kích hoạt là bắt buộc.",
  "plans.availability": "Tình trạng",
  "plans.basics": "Thông tin cơ bản",
  "plans.coverage": "Vùng phủ",
  "plans.create": "Tạo gói",
  "plans.createTitle": "Tạo gói",
  "plans.countries": "Quốc gia",
  "plans.currency": "Tiền tệ",
  "plans.currencyRequired": "Tiền tệ phải viết hoa.",
  "plans.dataAmount": "Dung lượng GB",
  "plans.dataRequired": "Dung lượng phải lớn hơn 0.",
  "plans.description": "Mô tả",
  "plans.editTitle": "Sửa gói eSIM",
  "plans.features": "Tính năng",
  "plans.featuresHint": "Mỗi dòng một nhãn.",
  "plans.hideConfirmBody":
    "{{title}} sẽ không còn xuất hiện trong catalog khách hàng. Đơn hàng hiện có và lịch sử eSIM vẫn được giữ nguyên.",
  "plans.hideConfirmTitle": "Ẩn gói này khỏi khách hàng?",
  "plans.hideSaving": "Đang ẩn...",
  "plans.hideSubmit": "Ẩn gói",
  "plans.networks": "Mạng",
  "plans.networksHint": "Mỗi dòng: ISO2 | Tên mạng | 4G/5G/LTE | Ghi chú tùy chọn",
  "plans.networksInvalid": "Mạng phải dùng: ISO2 | Tên mạng | 4G/5G/LTE | Ghi chú tùy chọn",
  "plans.newCountries": "Quốc gia mới",
  "plans.newCountriesHint": "Mỗi dòng: ISO2 | Tên quốc gia",
  "plans.newCountriesInvalid": "Quốc gia mới phải dùng: ISO2 | Tên quốc gia",
  "plans.noCoverage": "Chưa có vùng phủ",
  "plans.noMatch": "Không có gói nào khớp bộ lọc.",
  "plans.noPlans": "Chưa có gói.",
  "plans.price": "Giá",
  "plans.priceRequired": "Giá phải từ 0 trở lên.",
  "plans.pricing": "Giá bán",
  "plans.provider": "Nhà cung cấp",
  "plans.providerRequired": "Nhà cung cấp là bắt buộc.",
  "plans.regions": "Khu vực",
  "plans.save": "Lưu gói",
  "plans.saved": "Đã lưu gói.",
  "plans.saving": "Đang lưu...",
  "plans.search": "Tìm gói",
  "plans.support5g": "Hỗ trợ 5G",
  "plans.tethering": "Hỗ trợ chia sẻ mạng",
  "plans.title": "Gói eSIM",
  "plans.titleRequired": "Tên gói là bắt buộc.",
  "plans.unlimitedData": "Dung lượng không giới hạn",
  "plans.unlimitedNoAmount": "Gói không giới hạn không nên có dung lượng.",
  "plans.validityDays": "Số ngày hiệu lực",
  "plans.validityRequired": "Hiệu lực phải lớn hơn 0.",
  "revenue.byCoverage": "Doanh thu theo vùng phủ",
  "revenue.byDay": "Doanh thu theo ngày",
  "revenue.byPlan": "Doanh thu theo gói",
  "revenue.byStatus": "Doanh thu theo trạng thái",
  "revenue.chartSeries": "Doanh thu",
  "revenue.defaultHint":
    "Doanh thu mặc định tính đơn đã thanh toán. Trạng thái khác chỉ được tính khi chọn.",
  "revenue.dateRange": "{{start}} đến {{end}}",
  "revenue.filtered": "Doanh thu đã lọc",
  "revenue.includedStatuses": "Trạng thái đã chọn",
  "revenue.noCoverage": "Không có đóng góp vùng phủ trong khoảng này.",
  "revenue.noOrdersRange": "Không có đơn hàng trong khoảng ngày này.",
  "revenue.noRange": "Không có doanh thu trong khoảng ngày này.",
  "revenue.paidDefault": "Mặc định tính doanh thu",
  "sidebar.manage": "Quản lý gói AirConnect, doanh thu và đơn hàng.",
  "sidebar.menu": "Menu",
  "status.canceled": "Đã hủy",
  "status.failed": "Thất bại",
  "status.paid": "Đã thanh toán",
  "status.pending": "Đang chờ",
};

const dictionaries: Record<LanguageCode, Dictionary> = { en, vi };

function isLanguageCode(value: string | null): value is LanguageCode {
  return value === "en" || value === "vi";
}

function getSavedLanguage() {
  try {
    const saved = globalThis.localStorage?.getItem(storageKey);
    return isLanguageCode(saved) ? saved : defaultLanguage;
  } catch {
    return defaultLanguage;
  }
}

function format(template: string, vars?: Vars) {
  if (!vars) return template;

  return Object.entries(vars).reduce(
    (text, [key, value]) => text.split(`{{${key}}}`).join(String(value)),
    template
  );
}

export function localeForLanguage(language: LanguageCode) {
  return language === "vi" ? "vi-VN" : "en-US";
}

type I18nValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string, vars?: Vars) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(getSavedLanguage);

  const value = useMemo<I18nValue>(() => {
    function setLanguage(nextLanguage: LanguageCode) {
      setLanguageState(nextLanguage);

      try {
        globalThis.localStorage?.setItem(storageKey, nextLanguage);
      } catch {
        // Session-level language changes still work if persistence is unavailable.
      }
    }

    function t(key: string, vars?: Vars) {
      return format(dictionaries[language][key] ?? en[key] ?? key, vars);
    }

    return { language, setLanguage, t };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
