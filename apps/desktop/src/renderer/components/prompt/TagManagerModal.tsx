import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { EditIcon, Trash2Icon, SearchIcon, CheckIcon, XIcon, Loader2Icon } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { usePromptStore } from '../../stores/prompt.store';
import { useToast } from '../ui/Toast';
import { scheduleAllSaveSync } from '../../services/webdav-save-sync';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TagManagerModal({ isOpen, onClose }: TagManagerModalProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const fetchPrompts = usePromptStore((state) => state.fetchPrompts);

  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [processingTag, setProcessingTag] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTags();
    } else {
      setSearch('');
      setEditingTag(null);
      setProcessingTag(null);
    }
  }, [isOpen]);

  const loadTags = async () => {
    try {
      setLoading(true);
      const allTags = await window.api.prompt.getAllTags();
      setTags(allTags);
    } catch (error) {
      console.error('Failed to load tags:', error);
      showToast(t('common.error', 'Error'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (oldTag: string) => {
    const newTag = editValue.trim();
    if (!newTag || newTag === oldTag) {
      setEditingTag(null);
      return;
    }
    if (tags.includes(newTag)) {
      // If target exists, just confirm as it will merge
    }

    try {
      setProcessingTag(oldTag);
      await window.api.prompt.renameTag(oldTag, newTag);
      await fetchPrompts();
      await loadTags();
      scheduleAllSaveSync('tag renamed');
      showToast(t('common.success', 'Success'), 'success');
    } catch (error) {
      console.error('Failed to rename tag:', error);
      showToast(t('common.error', 'Error'), 'error');
    } finally {
      setProcessingTag(null);
      setEditingTag(null);
    }
  };

  const handleDelete = async (tag: string) => {
    if (!window.confirm(t('common.confirmDelete', 'Are you sure you want to delete this?'))) {
      return;
    }

    try {
      setProcessingTag(tag);
      await window.api.prompt.deleteTag(tag);
      await fetchPrompts();
      await loadTags();
      scheduleAllSaveSync('tag deleted');
      showToast(t('common.success', 'Success'), 'success');
    } catch (error) {
      console.error('Failed to delete tag:', error);
      showToast(t('common.error', 'Error'), 'error');
    } finally {
      setProcessingTag(null);
    }
  };

  const filteredTags = useMemo(() => {
    if (!search.trim()) return tags;
    const lowerSearch = search.toLowerCase();
    return tags.filter(t => t.toLowerCase().includes(lowerSearch));
  }, [tags, search]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('nav.tags', 'Tags')}
      size="md"
    >
      <div className="flex flex-col h-[50vh] max-h-[500px]">
        <div className="relative mb-4 shrink-0">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('common.search', 'Search...')}
            className="pl-9 w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2 space-y-1">
          {loading ? (
            <div className="flex justify-center items-center h-full text-muted-foreground">
              <Loader2Icon className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="flex justify-center items-center h-full text-sm text-muted-foreground">
              {t('common.noData', 'No data')}
            </div>
          ) : (
            filteredTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center justify-between group p-2 hover:bg-muted/50 rounded-lg transition-colors"
              >
                {editingTag === tag ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <Input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(tag);
                        if (e.key === 'Escape') setEditingTag(null);
                      }}
                      className="h-8 flex-1"
                      disabled={processingTag === tag}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                      onClick={() => handleRename(tag)}
                      disabled={processingTag === tag}
                    >
                      {processingTag === tag ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 shrink-0"
                      onClick={() => setEditingTag(null)}
                      disabled={processingTag === tag}
                    >
                      <XIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm font-medium truncate flex-1" title={tag}>
                      {tag}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setEditingTag(tag);
                          setEditValue(tag);
                        }}
                        disabled={processingTag !== null}
                      >
                        <EditIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(tag)}
                        disabled={processingTag !== null}
                      >
                        {processingTag === tag ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Trash2Icon className="w-4 h-4" />}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
