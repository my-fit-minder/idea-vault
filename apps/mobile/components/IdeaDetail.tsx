// Idea detail screen for mobile app
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../constants/theme';
import { syncService } from '../lib/syncService';
import type { Idea } from '../lib/types';

interface IdeaDetailProps {
  idea: Idea;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
  onIdeaUpdated: (idea: Idea) => void;
}

export function IdeaDetail({
  idea,
  onEdit,
  onDelete,
  onBack,
  onIdeaUpdated,
}: IdeaDetailProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme];
  const { isOnline } = useNetworkStatus();

  const [regenerating, setRegenerating] = useState(false);
  const [regeneratingRoadmap, setRegeneratingRoadmap] = useState(false);
  const [regeneratingValidationRoadmap, setRegeneratingValidationRoadmap] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [isReportExpanded, setIsReportExpanded] = useState(true);
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState(true);
  const [isValidationRoadmapExpanded, setIsValidationRoadmapExpanded] = useState(true);

  const isLocalOnly = idea.id.startsWith('local-');

  // Markdown styles for AI report
  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
    },
    heading1: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    heading2: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: colors.text,
      marginTop: 14,
      marginBottom: 6,
    },
    heading3: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginTop: 12,
      marginBottom: 4,
    },
    paragraph: {
      marginTop: 0,
      marginBottom: 10,
    },
    bullet_list: {
      marginBottom: 10,
    },
    ordered_list: {
      marginBottom: 10,
    },
    list_item: {
      marginBottom: 4,
    },
    strong: {
      fontWeight: '600' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    blockquote: {
      backgroundColor: '#f0f0f0',
      borderLeftWidth: 4,
      borderLeftColor: colors.tint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    code_inline: {
      backgroundColor: '#f0f0f0',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 13,
    },
    code_block: {
      backgroundColor: '#f0f0f0',
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
      fontFamily: 'monospace',
      fontSize: 13,
    },
    hr: {
      backgroundColor: '#e0e0e0',
      height: 1,
      marginVertical: 16,
    },
    link: {
      color: colors.tint,
    },
  };

  const handleRegenerate = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'Cannot generate AI reports while offline');
      return;
    }

    if (isLocalOnly) {
      Alert.alert('Sync Required', 'Please sync your idea first before generating AI reports');
      return;
    }

    setRegenerating(true);
    setRegeneratingRoadmap(true);
    setRegeneratingValidationRoadmap(true);
    try {
      // Regenerate all three reports in parallel
      const [reportResult, roadmapResult, validationRoadmapResult] = await Promise.all([
        syncService.generateReport(idea.id),
        syncService.generateRoadmap(idea.id),
        syncService.generateValidationRoadmap(idea.id),
      ]);
      
      // Update with the validation roadmap result (which should have all reports)
      // Fall back to other results if needed
      if (validationRoadmapResult.idea) {
        onIdeaUpdated(validationRoadmapResult.idea);
      } else if (roadmapResult.idea) {
        onIdeaUpdated(roadmapResult.idea);
      } else if (reportResult.idea) {
        onIdeaUpdated(reportResult.idea);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to regenerate reports');
    } finally {
      setRegenerating(false);
      setRegeneratingRoadmap(false);
      setRegeneratingValidationRoadmap(false);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      const updatedIdea = await syncService.archiveIdea(idea.id);
      onIdeaUpdated(updatedIdea);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to archive idea');
    } finally {
      setArchiving(false);
    }
  };

  const handleDeleteConfirm = () => {
    Alert.alert(
      'Delete Idea',
      `Are you sure you want to delete "${idea.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const styles = createStyles(isDark, colors);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onEdit} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title and Meta */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{idea.title}</Text>
            {isLocalOnly && (
              <View style={styles.localBadge}>
                <Text style={styles.localBadgeText}>Not synced</Text>
              </View>
            )}
            {idea.archived && (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>Archived</Text>
              </View>
            )}
          </View>
          <Text style={styles.meta}>
            Created: {new Date(idea.created_at).toLocaleDateString()}
          </Text>
        </View>

        {/* Description */}
        {idea.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.contentText}>{idea.content}</Text>
          </View>
        )}

        {/* AI Context */}
        {idea.ai_context && (
          <View style={[styles.section, styles.aiContextSection]}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>AI Context</Text>
              <View style={styles.contextBadge}>
                <Text style={styles.contextBadgeText}>For AI Reference</Text>
              </View>
            </View>
            <Text style={styles.contextText}>{idea.ai_context}</Text>
            <Text style={styles.contextNote}>
              This additional context helps AI generate better descriptions with correct understanding.
            </Text>
          </View>
        )}

        {/* Tags */}
        {idea.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {idea.tags.map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Report */}
        {idea.ai_report && (
          <View style={[styles.section, styles.reportSection]}>
            <TouchableOpacity
              style={styles.reportHeader}
              onPress={() => setIsReportExpanded(!isReportExpanded)}
            >
              <View>
                <Text style={styles.sectionTitle}>Startup Idea Analysis Report</Text>
                <Text style={styles.reportSubtitle}>
                  AI-generated analysis including market validation and recommendations
                </Text>
              </View>
              <Text style={styles.expandIcon}>{isReportExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isReportExpanded && (
              <View style={styles.reportContent}>
                <Markdown style={markdownStyles}>{idea.ai_report}</Markdown>
              </View>
            )}
          </View>
        )}

        {/* Product Roadmap */}
        {idea.ai_roadmap && (
          <View style={[styles.section, styles.roadmapSection]}>
            <TouchableOpacity
              style={styles.reportHeader}
              onPress={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
            >
              <View>
                <Text style={styles.sectionTitle}>Product Roadmap</Text>
                <Text style={styles.reportSubtitle}>
                  Practical product roadmap with MVP scope, user flows, and validation milestones
                </Text>
              </View>
              <Text style={styles.expandIcon}>{isRoadmapExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isRoadmapExpanded && (
              <View style={styles.reportContent}>
                <Markdown style={markdownStyles}>{idea.ai_roadmap}</Markdown>
              </View>
            )}
          </View>
        )}

        {/* Validation Roadmap */}
        {idea.ai_validation_roadmap && (
          <View style={[styles.section, styles.validationRoadmapSection]}>
            <TouchableOpacity
              style={styles.reportHeader}
              onPress={() => setIsValidationRoadmapExpanded(!isValidationRoadmapExpanded)}
            >
              <View>
                <Text style={styles.sectionTitle}>Validation Roadmap</Text>
                <Text style={styles.reportSubtitle}>
                  Idea-specific validation roadmap with hypotheses, experiments, and decision rules
                </Text>
              </View>
              <Text style={styles.expandIcon}>{isValidationRoadmapExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            {isValidationRoadmapExpanded && (
              <View style={styles.reportContent}>
                <Markdown style={markdownStyles}>{idea.ai_validation_roadmap}</Markdown>
              </View>
            )}
          </View>
        )}

        {/* Generate Reports Button */}
        {(!idea.ai_report || !idea.ai_roadmap || !idea.ai_validation_roadmap) && !isLocalOnly && (
          <TouchableOpacity
            style={[styles.generateButton, (!isOnline || regenerating || regeneratingRoadmap || regeneratingValidationRoadmap) && styles.generateButtonDisabled]}
            onPress={handleRegenerate}
            disabled={!isOnline || regenerating || regeneratingRoadmap || regeneratingValidationRoadmap}
          >
            {(regenerating || regeneratingRoadmap || regeneratingValidationRoadmap) ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.generateButtonIcon}>✨</Text>
                <Text style={styles.generateButtonText}>Generate Reports</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Regenerate Reports Button */}
        {idea.ai_report && idea.ai_roadmap && idea.ai_validation_roadmap && !isLocalOnly && (
          <TouchableOpacity
            style={[styles.regenerateButton, (!isOnline || regenerating || regeneratingRoadmap || regeneratingValidationRoadmap) && styles.regenerateButtonDisabled]}
            onPress={handleRegenerate}
            disabled={!isOnline || regenerating || regeneratingRoadmap || regeneratingValidationRoadmap}
          >
            {(regenerating || regeneratingRoadmap || regeneratingValidationRoadmap) ? (
              <ActivityIndicator color="#667eea" />
            ) : (
              <>
                <Text style={styles.regenerateButtonIcon}>🔄</Text>
                <Text style={styles.regenerateButtonText}>Regenerate Reports</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={handleArchive}
            disabled={archiving}
          >
            {archiving ? (
              <ActivityIndicator color="#4a5568" size="small" />
            ) : (
              <Text style={styles.archiveButtonText}>
                {idea.archived ? '📤 Unarchive' : '📥 Archive'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteConfirm}>
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (isDark: boolean, colors: typeof Colors.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f7fafc',
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
    backButton: {
      paddingVertical: 4,
    },
    backText: {
      fontSize: 16,
      color: '#667eea',
    },
    headerButton: {
      paddingVertical: 4,
    },
    headerButtonText: {
      fontSize: 16,
      color: '#667eea',
      fontWeight: '500',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    titleSection: {
      marginBottom: 24,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: '#1a202c',
      flex: 1,
    },
    localBadge: {
      backgroundColor: '#ebf8ff',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    localBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#3182ce',
    },
    archivedBadge: {
      backgroundColor: '#edf2f7',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    archivedBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#718096',
    },
    meta: {
      fontSize: 14,
      color: '#a0aec0',
    },
    section: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#e2e8f0',
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#1a202c',
      marginBottom: 8,
    },
    contentText: {
      fontSize: 16,
      color: '#4a5568',
      lineHeight: 24,
    },
    aiContextSection: {
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderStyle: 'dashed',
    },
    contextBadge: {
      backgroundColor: '#edf2f7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    contextBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#718096',
    },
    contextText: {
      fontSize: 14,
      color: '#718096',
      lineHeight: 22,
      fontStyle: 'italic',
    },
    contextNote: {
      fontSize: 12,
      color: '#a0aec0',
      marginTop: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tag: {
      backgroundColor: '#edf2f7',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 14,
      color: '#4a5568',
    },
    reportSection: {
      backgroundColor: '#f0f4ff',
      borderColor: '#c3dafe',
    },
    roadmapSection: {
      backgroundColor: '#f0fff4',
      borderColor: '#c6f6d5',
    },
    validationRoadmapSection: {
      backgroundColor: '#fff5f0',
      borderColor: '#fed7cc',
    },
    reportHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    reportSubtitle: {
      fontSize: 12,
      color: '#a0aec0',
      marginBottom: 8,
    },
    expandIcon: {
      fontSize: 12,
      color: '#a0aec0',
      marginTop: 4,
    },
    reportContent: {
      marginTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#c3dafe',
      paddingTop: 12,
    },
    reportText: {
      fontSize: 14,
      color: '#4a5568',
      lineHeight: 22,
    },
    generateButton: {
      flexDirection: 'row',
      backgroundColor: '#667eea',
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      gap: 8,
    },
    generateButtonDisabled: {
      opacity: 0.6,
    },
    generateButtonIcon: {
      fontSize: 18,
    },
    generateButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    regenerateButton: {
      flexDirection: 'row',
      backgroundColor: '#f7fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      gap: 8,
    },
    regenerateButtonDisabled: {
      opacity: 0.6,
    },
    regenerateButtonIcon: {
      fontSize: 16,
    },
    regenerateButtonText: {
      color: '#667eea',
      fontSize: 14,
      fontWeight: '600',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    archiveButton: {
      flex: 1,
      backgroundColor: '#f7fafc',
      borderWidth: 1,
      borderColor: '#e2e8f0',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    archiveButtonText: {
      color: '#4a5568',
      fontSize: 14,
      fontWeight: '600',
    },
    deleteButton: {
      flex: 1,
      backgroundColor: '#fed7d7',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
    },
    deleteButtonText: {
      color: '#c53030',
      fontSize: 14,
      fontWeight: '600',
    },
  });
