// Authentication screen for mobile app
// Follows iOS and Android design guidelines
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signIn, signUp, signInWithGoogle, resetPassword } from '../lib/auth';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';

type AuthMode = 'signIn' | 'signUp' | 'forgotPassword';

export function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signIn({ email, password });
      // Auth state will update automatically via the store
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!acceptPrivacy) {
      setError('Please accept the Privacy Policy');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await signUp({ email, password });
      if (result.user && !result.session) {
        // Email confirmation required
        Alert.alert(
          'Check your email',
          'We sent you a confirmation link. Please check your inbox to activate your account.',
          [{ text: 'OK', onPress: () => setMode('signIn') }]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    switch (mode) {
      case 'signIn':
        handleSignIn();
        break;
      case 'signUp':
        handleSignUp();
        break;
      case 'forgotPassword':
        handleForgotPassword();
        break;
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setEmailSent(false);
  };

  const styles = createStyles(isDark, colors);

  // Forgot password success screen
  if (mode === 'forgotPassword' && emailSent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.checkEmailTitle}>Check your email</Text>
          <Text style={styles.subtitle}>
            We have sent a password reset link to {email}
          </Text>
          <Text style={styles.helperText}>
            Please check your inbox and click the link to reset your password. The link will expire in 1 hour.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => switchMode('signIn')}
          >
            <Text style={styles.primaryButtonText}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Logo */}
            <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.subtitle}>
              {mode === 'signIn' && 'Welcome back!'}
              {mode === 'signUp' && 'Create your account'}
              {mode === 'forgotPassword' && 'Reset your password'}
            </Text>

            {/* Google Sign In - Only on sign in/up */}
            {mode !== 'forgotPassword' && (
              <>
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Text style={styles.googleButtonText}>
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>
              </>
            )}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#a0aec0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password Input - Only on sign in/up */}
            {mode !== 'forgotPassword' && (
              <View style={styles.inputContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  {mode === 'signIn' && (
                    <TouchableOpacity onPress={() => switchMode('forgotPassword')}>
                      <Text style={styles.forgotPassword}>Forgot password?</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#a0aec0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType={mode === 'signUp' ? 'newPassword' : 'password'}
                  autoComplete={mode === 'signUp' ? 'password-new' : 'password'}
                  editable={!loading}
                />
              </View>
            )}

            {/* Privacy Policy Checkbox - Only on sign up */}
            {mode === 'signUp' && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              >
                <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
                  {acceptPrivacy && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I accept the{' '}
                  <Text
                    style={styles.link}
                    onPress={() => Linking.openURL('https://ideafy.zensthub.com/privacy/')}
                  >
                    Privacy Policy
                  </Text>
                </Text>
              </TouchableOpacity>
            )}

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                loading && styles.primaryButtonDisabled,
                mode === 'signUp' && !acceptPrivacy && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading || (mode === 'signUp' && !acceptPrivacy)}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {mode === 'signIn' && 'Sign In'}
                  {mode === 'signUp' && 'Sign Up'}
                  {mode === 'forgotPassword' && 'Send Reset Link'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Mode Switch */}
            <View style={styles.footer}>
              {mode === 'signIn' && (
                <TouchableOpacity onPress={() => switchMode('signUp')}>
                  <Text style={styles.footerText}>
                    Do not have an account?{' '}
                    <Text style={styles.footerLink}>Sign up</Text>
                  </Text>
                </TouchableOpacity>
              )}
              {mode === 'signUp' && (
                <TouchableOpacity onPress={() => switchMode('signIn')}>
                  <Text style={styles.footerText}>
                    Already have an account?{' '}
                    <Text style={styles.footerLink}>Sign in</Text>
                  </Text>
                </TouchableOpacity>
              )}
              {mode === 'forgotPassword' && (
                <TouchableOpacity onPress={() => switchMode('signIn')}>
                  <Text style={styles.footerText}>
                    <Text style={styles.footerLink}>Back to Sign In</Text>
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#667eea', // Purple gradient start color - matches web
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      paddingVertical: 40,
    },
    content: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: 32,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
    },
    logo: {
      width: 200,
      height: 100,
      alignSelf: 'center',
      marginBottom: 16,
    },
    checkEmailTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1a202c',
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: '#718096',
      textAlign: 'center',
      marginBottom: 32,
    },
    helperText: {
      fontSize: 14,
      color: '#718096',
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    googleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4a5568',
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: '#e2e8f0',
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      color: '#718096',
    },
    inputContainer: {
      marginBottom: 20,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: '#4a5568',
      marginBottom: 8,
    },
    forgotPassword: {
      fontSize: 13,
      fontWeight: '500',
      color: '#667eea',
      marginBottom: 8,
    },
    input: {
      backgroundColor: '#fff',
      borderWidth: 2,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      fontSize: 16,
      color: '#1a202c',
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      marginTop: 4,
    },
    checkbox: {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: '#e2e8f0',
      marginRight: 10,
      marginTop: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxChecked: {
      backgroundColor: '#667eea',
      borderColor: '#667eea',
    },
    checkmark: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '700',
    },
    checkboxLabel: {
      flex: 1,
      fontSize: 14,
      color: '#4a5568',
      lineHeight: 20,
    },
    link: {
      color: '#667eea',
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    errorContainer: {
      backgroundColor: '#fed7d7',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    errorText: {
      color: '#c53030',
      fontSize: 14,
      textAlign: 'center',
    },
    primaryButton: {
      backgroundColor: '#667eea',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 20,
    },
    primaryButtonDisabled: {
      opacity: 0.6,
    },
    primaryButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: '#4a5568',
    },
    footerLink: {
      color: '#667eea',
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
  });
