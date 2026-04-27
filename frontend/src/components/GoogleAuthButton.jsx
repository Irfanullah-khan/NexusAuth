// import { useCallback, useState } from 'react';
// import toast from 'react-hot-toast';
// import api from '../api/axios';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';

// // Google Client ID from Vite env — set VITE_GOOGLE_CLIENT_ID in frontend/.env
// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// /**
//  * GoogleAuthButton
//  * ────────────────
//  * Renders a premium "Continue with Google" button.
//  *
//  * Flow:
//  *  1. User clicks the button
//  *  2. GIS (Google Identity Services) is initialized with our Client ID
//  *  3. google.accounts.id.prompt() opens the One Tap / Google popup
//  *  4. On success, Google returns a signed ID token (credential)
//  *  5. We POST the credential to /api/auth/google (server verifies it)
//  *  6. Server issues JWT cookies and returns user data
//  *  7. We update AuthContext and navigate to /dashboard
//  *
//  * Props:
//  *  label  – button text (default: "Continue with Google")
//  */
// export default function GoogleAuthButton({ label = 'Continue with Google' }) {
//   const { login } = useAuth();
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);

//   // Called by GIS after user selects a Google account
//   const handleCredentialResponse = useCallback(async (response) => {
//     if (!response?.credential) {
//       toast.error('No credential received from Google. Please try again.');
//       setLoading(false);
//       return;
//     }

//     try {
//       // Send the ID token to our backend for server-side verification
//       const res = await api.post('/auth/google', { credential: response.credential });
//       login(res.data.data.user);
//       toast.success(`Welcome, ${res.data.data.user.name}! 🎉`);
//       navigate('/dashboard', { replace: true });
//     } catch (err) {
//       const msg = err.response?.data?.message || 'Google sign-in failed. Please try again.';
//       toast.error(msg);
//     } finally {
//       setLoading(false);
//     }
//   }, [login, navigate]);

//   const handleClick = useCallback(() => {
//     // Guard: GIS script not loaded yet
//     if (!window.google?.accounts?.id) {
//       toast.error('Google Sign-In is not ready yet. Please refresh and try again.');
//       return;
//     }

//     // Guard: Client ID missing
//     if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
//       toast.error('Google Client ID is not configured. Please check your .env file.');
//       return;
//     }

//     setLoading(true);

//     // Initialize GIS with our Client ID and callback
//     window.google.accounts.id.initialize({
//       client_id: GOOGLE_CLIENT_ID,
//       callback: handleCredentialResponse,
//       auto_select: false,
//       cancel_on_tap_outside: true,
//       context: 'signin',
//     });

//     // Open the Google One Tap / popup
//     window.google.accounts.id.prompt((notification) => {
//       if (notification.isNotDisplayed()) {
//         // Popup was blocked by browser or not supported
//         setLoading(false);
//         toast.error(
//           'Google popup was blocked. Please allow popups for this site and try again.',
//           { duration: 5000 }
//         );
//       } else if (notification.isSkippedMoment()) {
//         // User dismissed the prompt — not an error
//         setLoading(false);
//       }
//       // isDismissedMoment → user closed it; handled by GIS internally
//     });
//   }, [handleCredentialResponse]);

//   return (
//     <button
//       type="button"
//       className="btn-google"
//       onClick={handleClick}
//       disabled={loading}
//       aria-label="Continue with Google"
//     >
//       {loading ? (
//         <span className="google-btn-inner">
//           <span className="spinner" style={{ borderTopColor: '#4285F4', borderColor: 'rgba(66,133,244,0.3)' }} />
//           Signing in...
//         </span>
//       ) : (
//         <span className="google-btn-inner">
//           {/* Official Google "G" SVG icon */}
//           <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
//             <path
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               fill="#4285F4"
//             />
//             <path
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               fill="#34A853"
//             />
//             <path
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               fill="#FBBC05"
//             />
//             <path
//               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               fill="#EA4335"
//             />
//           </svg>
//           {label}
//         </span>
//       )}
//     </button>
//   );
// }















import { useCallback, useEffect,useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * GoogleAuthButton (2026 Production Version)
 * ------------------------------------------
 * ✅ FedCM Ready
 * ✅ Cleaner popup flow
 * ✅ No deprecated prompt status callbacks
 * ✅ Better error handling
 * ✅ Uses your custom button UI
 * ✅ Works with existing backend: POST /api/auth/google
 */

export default function GoogleAuthButton({
  label = 'Continue with Google',
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  /**
   * Handle successful Google credential response
   */
  const handleCredentialResponse = useCallback(
    async (response) => {
      if (!response?.credential) {
        toast.error('No Google credential received.');
        setLoading(false);
        return;
      }

      try {
        const res = await api.post('/auth/google', {
          credential: response.credential,
        });

        const user = res.data.data.user;

        login(user);

        toast.success(`Welcome, ${user.name}! 🎉`);

        navigate('/dashboard', { replace: true });
      } catch (err) {
        const message =
          err.response?.data?.message ||
          'Google sign-in failed. Please try again.';

        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [login, navigate]
  );

  useEffect(() => {
  if (initializedRef.current) return;

  if (!window.google?.accounts?.id) return;
  if (!GOOGLE_CLIENT_ID) return;

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin',
    use_fedcm_for_prompt: true,
  });

  initializedRef.current = true;
  setGoogleReady(true);
}, []);
  /**
   * Button click
   */
  const handleClick = useCallback(() => {
    if (!googleReady) {
      toast.error('Google Sign-In is still loading...');
      return;
    }

    setLoading(true);

    try {
      /**
       * Opens popup / FedCM flow
       * No deprecated notification callbacks used
       */
      window.google.accounts.id.prompt();
    } catch (error) {
      console.error(error);
      toast.error('Unable to open Google Sign-In popup.');
      setLoading(false);
    }
  }, [googleReady]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="btn-google"
      aria-label="Continue with Google"
    >
      {loading ? (
        <span className="google-btn-inner">
          <span
            className="spinner"
            style={{
              borderTopColor: '#4285F4',
              borderColor: 'rgba(66,133,244,0.25)',
            }}
          />
          Signing in...
        </span>
      ) : (
        <span className="google-btn-inner">
          {/* Google Icon */}
          <svg
            className="google-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>

          {label}
        </span>
      )}
    </button>
  );
}