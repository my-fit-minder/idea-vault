// Idea editor/create screen for mobile app
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../constants/theme';
import { syncService } from '../lib/syncService';
import type { Idea, CreateIdeaInput, UpdateIdeaInput } from '../lib/types';

interface IdeaEditorProps {
  idea?: Idea;
  onSave: () => void;
  onCancel: () => void;
}

export function IdeaEditor({ idea, onSave, onCancel }: IdeaEditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const { isOnline } = useNetworkStatus();

  const [title, setTitle] = useState(idea?.title || '');
  const [content, setContent] = useState(idea?.content || '');
  const [aiContext, setAiContext] = useState(idea?.ai_context || '');
  const [tags, setTags] = useState<string[]>(idea?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;

    if (tag.length > 15) {
      setError('Tag must be 15 characters or less');
      return;
    }

    if (tags.includes(tag)) {
      setError('Tag already exists');
      return;
    }

    if (tags.length >= 4) {
      setError('Maximum 4 tags allowed');
      return;
    }

    setTags([...tags, tag]);
    setTagInput('');
    setError(null);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 50) {
      setError('Title must be 50 characters or less');
      return;
    }

    if (content && content.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (idea) {
        const input: UpdateIdeaInput = {
          title,
          content: content || undefined,
          ai_context: aiContext || undefined,
          tags,
        };
        await syncService.updateIdea(idea.id, input);
      } else {
        const input: CreateIdeaInput = {
          title,
          content: content || undefined,
          ai_context: aiContext || undefined,
          tags,
        };
        await syncService.createIdea(input);
      }
      onSave();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save idea';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const styles = createStyles(isDark, colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {idea ? 'Edit Idea' : 'New Idea'}
          </Text>
          <TouchableOpacity
            onPress={handleSubmit}
            style={[styles.headerButton, loading && styles.headerButtonDisabled]}
            disabled={loading || !title.trim()}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#667eea" />
            ) : (
              <Text
                style={[
                  styles.saveText,
                  (!title.trim() || title.length > 50) && styles.saveTextDisabled,
                ]}
              >
                {idea ? 'Update' : 'Create'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Offline Notice */}
        {!isOnline && (
          <View style={styles.offlineNotice}>
            <Text style={styles.offlineNoticeText}>
              📴 You're offline. Changes will sync when connected.
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Title *</Text>
              <Text style={[styles.charCount, title.length >= 50 && styles.charCountLimit]}>
                {title.length}/50
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter idea title..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={title}
              onChangeText={setTitle}
              maxLength={50}
              editable={!loading}
            />
          </View>

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={[styles.charCount, content.length >= 1000 && styles.charCountLimit]}>
                {content.length}/1000
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your idea..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              maxLength={1000}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* AI Context Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              AI Context{' '}
              <Text style={styles.labelHint}>(Optional - helps AI generate better descriptions)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea, styles.smallTextArea]}
              placeholder="Add context to help AI understand your idea better..."
              placeholderTextColor={isDark ? '#666' : '#999'}
              value={aiContext}
              onChangeText={setAiContext}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Tags Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Tags{' '}
                {tags.length > 0 && (
                  <Text style={styles.labelHint}>({tags.length}/4)</Text>
                )}
              </Text>
            </View>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                placeholder={tags.length >= 4 ? 'Max 4 tags' : 'Add a tag...'}
                placeholderTextColor="#a0aec0"
                value={tagInput}
                onChangeText={setTagInput}
                maxLength={15}
                editable={!loading && tags.length < 4}
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addTagButton, tags.length >= 4 && styles.addTagButtonDisabled]}
                onPress={handleAddTag}
                disabled={tags.length >= 4}
              >
                <Text style={styles.addTagButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveTag(tag)}
                      style={styles.removeTag}
                    >
                      <Text style={styles.removeTagText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f7fafc',
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e2e8f0',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    headerButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 60,
    },
    headerButtonDisabled: {
      opacity: 0.5,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#1a202c',
    },
    cancelText: {
      fontSize: 16,
      color: '#4a5568',
    },
    saveText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#667eea',
      textAlign: 'right',
    },
    saveTextDisabled: {
      opacity: 0.5,
    },
    offlineNotice: {
      backgroundColor: '#fef3c7',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    offlineNoticeText: {
      fontSize: 13,
      color: '#d97706',
      textAlign: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
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
    },
    labelHint: {
      fontSize: 12,
      fontWeight: '400',
      color: '#718096',
    },
    charCount: {
      fontSize: 12,
      color: '#718096',
    },
    charCountLimit: {
      color: '#c53030',
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
    textArea: {
      minHeight: 120,
      paddingTop: 12,
    },
    smallTextArea: {
      minHeight: 80,
    },
    tagInputContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    tagInput: {
      flex: 1,
    },
    addTagButton: {
      backgroundColor: '#667eea',
      borderRadius: 8,
      paddingHorizontal: 20,
      justifyContent: 'center',
    },
    addTagButtonDisabled: {
      opacity: 0.6,
    },
    addTagButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#edf2f7',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    tagText: {
      fontSize: 14,
      color: '#4a5568',
    },
    removeTag: {
      marginLeft: 6,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#cbd5e0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeTagText: {
      fontSize: 14,
      color: '#4a5568',
      fontWeight: '600',
      marginTop: -1,
    },
    errorContainer: {
      backgroundColor: '#fed7d7',
      borderRadius: 8,
      padding: 12,
      marginTop: 8,
    },
    errorText: {
      color: '#c53030',
      fontSize: 14,
      textAlign: 'center',
    },
  });
