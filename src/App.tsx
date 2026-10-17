import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import OnboardingTour from '@/presentation/components/OnboardingTour'
import ProgressSync from '@/presentation/components/ProgressSync'
import AuthProvider from '@/presentation/context/AuthProvider'
import AppShell from '@/presentation/layouts/AppShell'
import IntroGate from '@/presentation/layouts/IntroGate'
import AdminBookFormScreen from '@/presentation/screens/admin/AdminBookFormScreen'
import AdminBooksScreen from '@/presentation/screens/admin/AdminBooksScreen'
import AdminChapterEditorScreen from '@/presentation/screens/admin/AdminChapterEditorScreen'
import AdminChaptersScreen from '@/presentation/screens/admin/AdminChaptersScreen'
import AdminChapterUploadScreen from '@/presentation/screens/admin/AdminChapterUploadScreen'
import AdminRoute from '@/presentation/screens/admin/AdminRoute'
import AdminSettingsScreen from '@/presentation/screens/admin/AdminSettingsScreen'
import LoginScreen from '@/presentation/screens/auth/LoginScreen'
import SignUpScreen from '@/presentation/screens/auth/SignUpScreen'
import BookDetailScreen from '@/presentation/screens/book/BookDetailScreen'
import DownloadsScreen from '@/presentation/screens/downloads/DownloadsScreen'
import HomeScreen from '@/presentation/screens/home/HomeScreen'
import LibraryScreen from '@/presentation/screens/library/LibraryScreen'
import PrivacyScreen from '@/presentation/screens/legal/PrivacyScreen'
import TermsScreen from '@/presentation/screens/legal/TermsScreen'
import NotificationsScreen from '@/presentation/screens/notifications/NotificationsScreen'
import ProfileScreen from '@/presentation/screens/profile/ProfileScreen'
import ReaderScreen from '@/presentation/screens/reader/ReaderScreen'
import SettingsScreen from '@/presentation/screens/settings/SettingsScreen'

export default function App() {
  return (
    <AuthProvider>
      <ProgressSync />
      <IntroGate>
        <BrowserRouter>
          <OnboardingTour />
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<HomeScreen />} />
              <Route path="library" element={<LibraryScreen />} />
              <Route path="books/:bookId" element={<BookDetailScreen />} />
              <Route path="profile" element={<ProfileScreen />} />
              <Route path="downloads" element={<DownloadsScreen />} />
              <Route path="signup" element={<SignUpScreen />} />
              <Route path="login" element={<LoginScreen />} />
              <Route path="privacy" element={<PrivacyScreen />} />
              <Route path="terms" element={<TermsScreen />} />

              <Route path="admin" element={<AdminRoute />}>
                <Route index element={<AdminBooksScreen />} />
                <Route path="settings" element={<AdminSettingsScreen />} />
                <Route path="books/new" element={<AdminBookFormScreen />} />
                <Route path="books/:bookId/edit" element={<AdminBookFormScreen />} />
                <Route path="books/:bookId/chapters" element={<AdminChaptersScreen />} />
                <Route path="books/:bookId/chapters/new" element={<AdminChapterEditorScreen />} />
                <Route path="books/:bookId/chapters/upload" element={<AdminChapterUploadScreen />} />
                <Route
                  path="books/:bookId/chapters/:chapterNumber/edit"
                  element={<AdminChapterEditorScreen />}
                />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            <Route path="settings" element={<SettingsScreen />} />
            <Route path="notifications" element={<NotificationsScreen />} />
            <Route path="books/:bookId/chapters/:chapterNumber" element={<ReaderScreen />} />
          </Routes>
        </BrowserRouter>
      </IntroGate>
    </AuthProvider>
  )
}