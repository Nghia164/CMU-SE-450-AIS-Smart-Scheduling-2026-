
cài nodejs
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install react-router-dom
npm install recharts

npm install -D tailwindcss @tailwindcss/vite

npm run dev








1. Tạo thư mục manager và 11 file:
if not exist "src\pages\manager" mkdir "src\pages\manager"
for %F in (AssistantPage AttendancePage DashboardPage EmployeesPage OpenShiftsPage PayrollPage ReportsPage RequestsPage SchedulingPage ShiftsPage TimesheetsPage) do if not exist "src\pages\manager\%F.jsx" type nul > "src\pages\manager\%F.jsx"


2. Tạo thư mục staff và 8 file:
if not exist "src\pages\staff" mkdir "src\pages\staff"
for %F in (AttendancePage AvailabilityPage HomePage LeavePage OpenShiftsPage SchedulePage SwapPage TimesheetsPage) do if not exist "src\pages\staff\%F.jsx" type nul > "src\pages\staff\%F.jsx"


3. Tạo thư mục admin và 4 file:
if not exist "src\pages\admin" mkdir "src\pages\admin"
for %F in (AccessPage AccountsPage HealthPage SettingsPage) do if not exist "src\pages\admin\%F.jsx" type nul > "src\pages




for %D in (admin manager staff) do if not exist "src\mock\%D" mkdir "src\mock\%D"
for %F in (AccessPage AccountsPage HealthPage SettingsPage) do if not exist "src\mock\admin\%F.mock.js" type nul > "src\mock\admin\%F.mock.js"
for %F in (AssistantPage AttendancePage DashboardPage EmployeesPage OpenShiftsPage PayrollPage ReportsPage RequestsPage SchedulingPage ShiftsPage TimesheetsPage) do if not exist "src\mock\manager\%F.mock.js" type nul > "src\mock\manager\%F.mock.js"
for %F in (AttendancePage AvailabilityPage HomePage LeavePage OpenShiftsPage SchedulePage SwapPage TimesheetsPage) do if not exist "src\mock\staff\%F.mock.js" type nul > "src\mock\staff\%F.mock.js"


if not exist "src\services\admin" mkdir "src\services\admin"
if not exist "src\services\manager" mkdir "src\services\manager"
if not exist "src\services\staff" mkdir "src\services\staff"

for %F in (accessService accountsService healthService settingsService) do if not exist "src\services\admin\%F.js" type nul > "src\services\admin\%F.js"

for %F in (assistantService attendanceService dashboardService employeeService openShiftService payrollService reportService requestService schedulingService shiftService timesheetService) do if not exist "src\services\manager\%F.js" type nul > "src\services\manager\%F.js"

for %F in (attendanceService availabilityService homeService leaveService openShiftService scheduleService swapService timesheetService) do if not exist "src\services\staff\%F.js" type nul > "src\services\staff\%F.js"