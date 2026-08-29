 
import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

import SuccessMessage from "../../toasts/SuccessMessage";
import ErrorMessage from "../../toasts/ErrorMessage";

const SignIn = () => {
    const router = useRouter();
    const { login } = useAuth();

    // ==============================
    // Form State
    // ==============================

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // ==============================
    // Toast State
    // ==============================

    const [successVisible, setSuccessVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const [errorVisible, setErrorVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // ==============================
    // Sign In
    // ==============================

    const handleSignIn = async () => {
        if (
            !email.trim() ||
            !password ||
            isLoading
        ) {
            return;
        }

        setIsLoading(true);

        // Hide any previous error
        setErrorVisible(false);

        try {
            const response = await fetch(
                "http://localhost:5002/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        email: email.trim(),
                        password,
                    }),
                }
            );

            const data = await response.json();

            console.log("Login response:", data);

            // ==============================
            // Backend Error
            // ==============================

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            // ==============================
            // Successful Login
            // ==============================

            console.log(
                "Access Token:",
                data.accessToken
            );

            console.log(
                "Refresh Token:",
                data.refreshToken
            );

            console.log(
                "Logged-in User:",
                data.user
            );

            // Store user + access token
            await login(
                data.user,
                data.accessToken
            );

            // ==============================
            // Check User Role
            // ==============================

            if (data.user?.role !== "ADMIN") {
                throw new Error(
                    "You are not authorized to access the admin dashboard."
                );
            }

            // ==============================
            // Show Success Toast
            // ==============================

            setSuccessMessage(
                "Login successful! Welcome back."
            );

            setSuccessVisible(true);

            // ==============================
            // Navigate to Dashboard
            // ==============================

            setTimeout(() => {
                router.replace(
                    "/dashboards/adminDashboard"
                );
            }, 1200);

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            // Extract error message
            const message =
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again.";

            // Show error toast
            setErrorMessage(message);
            setErrorVisible(true);

        } finally {
            setIsLoading(false);
        }
    };

    // ==============================
    // Form Validation
    // ==============================

    const isFormValid =
        email.trim().length > 0 &&
        password.length > 0;

    // ==============================
    // UI
    // ==============================

    return (
        <SafeAreaView style={styles.container}>

            {/* ==============================
                Success Toast
            ============================== */}

            <SuccessMessage
                visible={successVisible}
                message={successMessage}
                onHide={() =>
                    setSuccessVisible(false)
                }
                duration={1500}
            />

            {/* ==============================
                Error Toast
            ============================== */}

            <ErrorMessage
                visible={errorVisible}
                message={errorMessage}
                onHide={() =>
                    setErrorVisible(false)
                }
                duration={3500}
            />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={
                    Platform.OS === "ios"
                        ? "padding"
                        : "height"
                }
            >

                <ScrollView
                    contentContainerStyle={
                        styles.scrollContent
                    }
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* ==============================
                        Header
                    ============================== */}

                    <View style={styles.header}>

                        <View style={styles.logoBadge}>
                            <Text style={styles.logo}>
                                MealBridge
                            </Text>
                        </View>

                        <Text style={styles.title}>
                            Welcome Back
                        </Text>

                        <Text style={styles.subtitle}>
                            Sign in to continue making a difference
                        </Text>

                    </View>

                    {/* ==============================
                        Form
                    ============================== */}

                    <View style={styles.form}>

                        {/* ==============================
                            Email
                        ============================== */}

                        <View style={styles.inputGroup}>

                            <Text style={styles.label}>
                                Email Address
                            </Text>

                            <TextInput
                                style={[
                                    styles.input,
                                    isEmailFocused &&
                                        styles.inputFocused,
                                ]}
                                placeholder="name@example.com"
                                placeholderTextColor="#A1A1AA"
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() =>
                                    setIsEmailFocused(true)
                                }
                                onBlur={() =>
                                    setIsEmailFocused(false)
                                }
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                                blurOnSubmit={false}
                            />

                        </View>

                        {/* ==============================
                            Password
                        ============================== */}

                        <View style={styles.inputGroup}>

                            <View
                                style={
                                    styles.passwordHeader
                                }
                            >

                                <Text style={styles.label}>
                                    Password
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() =>
                                        console.log(
                                            "Forgot password"
                                        )
                                    }
                                >
                                    <Text
                                        style={
                                            styles.forgotPassword
                                        }
                                    >
                                        Forgot Password?
                                    </Text>
                                </TouchableOpacity>

                            </View>

                            <View
                                style={[
                                    styles.passwordContainer,
                                    isPasswordFocused &&
                                        styles.inputFocused,
                                ]}
                            >

                                <TextInput
                                    style={
                                        styles.passwordInput
                                    }
                                    placeholder="Enter your password"
                                    placeholderTextColor="#A1A1AA"
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() =>
                                        setIsPasswordFocused(
                                            true
                                        )
                                    }
                                    onBlur={() =>
                                        setIsPasswordFocused(
                                            false
                                        )
                                    }
                                    secureTextEntry={
                                        !showPassword
                                    }
                                    textContentType="password"
                                    autoComplete="password"
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="done"
                                    onSubmitEditing={
                                        handleSignIn
                                    }
                                />

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={
                                        styles.showButton
                                    }
                                    onPress={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >

                                    <Text
                                        style={
                                            styles.showText
                                        }
                                    >
                                        {showPassword
                                            ? "Hide"
                                            : "Show"}
                                    </Text>

                                </TouchableOpacity>

                            </View>

                        </View>

                        {/* ==============================
                            Sign In Button
                        ============================== */}

                        <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                                styles.signInButton,
                                !isFormValid &&
                                    styles.disabledButton,
                                isLoading &&
                                    styles.loadingButton,
                            ]}
                            disabled={
                                !isFormValid ||
                                isLoading
                            }
                            onPress={handleSignIn}
                        >

                            {isLoading ? (
                                <ActivityIndicator
                                    color="#FFFFFF"
                                    size="small"
                                />
                            ) : (
                                <Text
                                    style={
                                        styles.signInText
                                    }
                                >
                                    Sign In
                                </Text>
                            )}

                        </TouchableOpacity>

                        {/* ==============================
                            Divider
                        ============================== */}

                        <View
                            style={
                                styles.dividerContainer
                            }
                        >

                            <View
                                style={styles.divider}
                            />

                            <Text
                                style={
                                    styles.dividerText
                                }
                            >
                                OR
                            </Text>

                            <View
                                style={styles.divider}
                            />

                        </View>

                        {/* ==============================
                            Register
                        ============================== */}

                        <View
                            style={
                                styles.registerContainer
                            }
                        >

                            <Text
                                style={
                                    styles.registerText
                                }
                            >
                                Don't have an account?
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() =>
                                    console.log(
                                        "Navigate to Register"
                                    )
                                }
                            >

                                <Text
                                    style={
                                        styles.registerLink
                                    }
                                >
                                    {" "}Create Account
                                </Text>

                            </TouchableOpacity>

                        </View>

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

        </SafeAreaView>
    );
};

export default SignIn;

// ======================================================
// Styles
// ======================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },

    keyboardView: {
        flex: 1,
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 60,
        justifyContent: "center",
    },

    header: {
        alignItems: "center",
        marginBottom: 36,
    },

    logoBadge: {
        marginBottom: 20,
    },

    logo: {
        fontSize: 24,
        fontWeight: "800",
        color: "#FF6B00",
        letterSpacing: -0.5,
    },

    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#18181B",
        marginBottom: 8,
        letterSpacing: -0.5,
    },

    subtitle: {
        fontSize: 14,
        color: "#71717A",
        textAlign: "center",
        lineHeight: 20,
    },

    form: {
        width: "100%",
    },

    inputGroup: {
        marginBottom: 20,
    },

    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#3F3F46",
        marginBottom: 6,
    },

    input: {
        height: 52,
        borderWidth: 1.5,
        borderColor: "#E4E4E7",
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#18181B",
        backgroundColor: "#FAFAFA",
    },

    inputFocused: {
        borderColor: "#FF6B00",
        backgroundColor: "#FFFFFF",
    },

    passwordHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    passwordContainer: {
        height: 52,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "#E4E4E7",
        borderRadius: 12,
        backgroundColor: "#FAFAFA",
    },

    passwordInput: {
        flex: 1,
        height: "100%",
        paddingHorizontal: 16,
        fontSize: 15,
        color: "#18181B",
    },

    showButton: {
        paddingHorizontal: 16,
        height: "100%",
        justifyContent: "center",
    },

    showText: {
        color: "#FF6B00",
        fontSize: 13,
        fontWeight: "600",
    },

    forgotPassword: {
        fontSize: 13,
        fontWeight: "600",
        color: "#FF6B00",
    },

    signInButton: {
        height: 52,
        borderRadius: 12,
        backgroundColor: "#FF6B00",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,

        shadowColor: "#FF6B00",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,

        elevation: 3,
    },

    disabledButton: {
        backgroundColor: "#F4F4F5",
        shadowOpacity: 0,
        elevation: 0,
    },

    loadingButton: {
        opacity: 0.8,
    },

    signInText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
    },

    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
    },

    divider: {
        flex: 1,
        height: 1,
        backgroundColor: "#E4E4E7",
    },

    dividerText: {
        marginHorizontal: 12,
        fontSize: 11,
        fontWeight: "600",
        color: "#A1A1AA",
        letterSpacing: 0.5,
    },

    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    registerText: {
        fontSize: 14,
        color: "#71717A",
    },

    registerLink: {
        fontSize: 14,
        fontWeight: "700",
        color: "#FF6B00",
    },
});
 
