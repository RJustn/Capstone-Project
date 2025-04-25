import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Styles/forgotpassword.css';
import Swal from 'sweetalert2';

const ForgotPassword: React.FC = () => {
    const location = useLocation();
    const [email, setEmail] = useState(location.state?.email || ''); // Set initial state from location
    const [error, setError] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpCountdown, setOtpCountdown] = useState<number | null>(null); // Timer countdown state
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSendOtp = async () => {
        if (!email) return;

        try {
            const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/sendOTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccess('OTP sent to your email.');
                setOtpSent(true); // Disable the button
                setOtpCountdown(10); // Set the timer to 10 seconds
                setTimeout(() => {
                    setSuccess(null);
                }, 60);
                setError(null);
            } else {
                setError(data.error);
                setTimeout(() => {
                    setError(null);
                }, 60);
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            setError('Error sending OTP, please try again.');
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpCountdown !== null) {
            // Start countdown
            timer = setInterval(() => {
                setOtpCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
            }, 1000);
        }

        if (otpCountdown === 0) {
            // Re-enable button after countdown
            setOtpSent(false);
            setOtpCountdown(null);
        }

        return () => clearInterval(timer); // Clear interval on component unmount or when countdown reaches 0
    }, [otpCountdown]);

    const handleVerifyOtp = async () => {
        if (!email || !otp) return;

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[A-Za-z\d\S]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one uppercase letter, one number, and one special character.');
            return;
        }


        if (confirmpassword !== password) {
            setError('Password Not Match.');
            return;
        }

        try {
            const response = await fetch('https://capstone-project-backend-nu.vercel.app/auth/updatepassword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp, password }),
            });
            const data = await response.json();
            if (response.ok) {
                // Show SweetAlert success message
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed',
                    text: 'Your password has been successfully updated.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    navigate('/login'); // Redirect to login after user clicks OK
                });
                setError(null);
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Error verifying OTP, please try again.', error);
            setError('Error verifying OTP, please try again.');
        }
    };

    const handleCancel = () => {
        navigate('/'); // Redirect to home page
    };

    return (
        <body className="body">
            <div className="emailverification-container">
                <h1>Forgot Password</h1>
                {error && <p className="error">{error}</p>}
                {success && <p className="success">{success}</p>}
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="otp">Enter OTP:</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="otp">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="input-row">
                    <div className="form-group">
                        <label htmlFor="otp">Confirm Password:</label>
                        <input
                            type="password"
                            id="confirmpassword"
                            value={confirmpassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="button-group">
                    <button type="button" className="cancelForgotPassword" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className={`sendotp ${otpSent ? 'disabled-button' : ''}`}  // Add conditional class
                        onClick={handleSendOtp}
                        disabled={otpSent} // Disable button if OTP is sent
                    >
                        Send OTP
                    </button>
                    <label className="otp-timer-label">
                        {otpSent && otpCountdown !== null ? `(${otpCountdown}s)` : ''}
                    </label>
                    <button
                        type="button"
                        className="verifyemail"
                        onClick={handleVerifyOtp}
                    >
                        Change Password
                    </button>
                </div>
            </div>
        </body>
    );
};

export default ForgotPassword;
