import { graphQLRequest, MUTATIONS } from '../api/graphqlClient';
import { StoryItem } from '../types';
import { persistData, state } from './state';
import { escapeHtml, generateId, showToast } from './utils';

export function openStoryModal(): void {
  document.getElementById('storyModal')?.classList.remove('hidden');
}

export function closeStoryModal(): void {
  document.getElementById('storyModal')?.classList.add('hidden');
  const setEmpty = (id: string) => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.value = '';
  };
  setEmpty('stTitle');
  setEmpty('stTags');
  setEmpty('stS');
  setEmpty('stT');
  setEmpty('stA');
  setEmpty('stR');
}

export async function saveStory(): Promise<void> {
  const title = ((document.getElementById('stTitle') as HTMLInputElement)?.value || '').trim();
  if (!title) {
    showToast('Story title is required', 'error');
    return;
  }

  const tags = ((document.getElementById('stTags') as HTMLInputElement)?.value || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const situation = ((document.getElementById('stS') as HTMLTextAreaElement)?.value || '').trim();
  const task = ((document.getElementById('stT') as HTMLTextAreaElement)?.value || '').trim();
  const action = ((document.getElementById('stA') as HTMLTextAreaElement)?.value || '').trim();
  const result = ((document.getElementById('stR') as HTMLTextAreaElement)?.value || '').trim();

  const story: StoryItem = {
    id: generateId(),
    title,
    tags,
    situation,
    task,
    action,
    result,
  };

  state.storyBank.unshift(story);
  persistData();
  renderStoryBank();
  closeStoryModal();
  showToast('Story saved', 'success');

  graphQLRequest(MUTATIONS.CREATE_STORY, {
    input: { title, tags, situation, task, action, result },
  }).catch(() => {});
}

export function renderStoryBank(): void {
  const host = document.getElementById('storiesGrid');
  if (!host) return;

  if (!state.storyBank.length) {
    host.innerHTML = '<div class="card p-8 text-center text-stone-500">No stories yet. Add your first STAR story.</div>';
    return;
  }

  host.innerHTML = state.storyBank
    .map(
      (story) => `
        <div class="story-card card p-6 border border-stone-200">
            <div class="flex items-start justify-between gap-3">
                <div>
                    <p class="font-bold text-stone-900">${escapeHtml(story.title)}</p>
                    <div class="story-meta mt-2 flex flex-wrap gap-1.5">
                        ${
                          story.tags.length
                            ? story.tags.map((tag) => `<span class="tag-pill">${escapeHtml(tag)}</span>`).join('')
                            : '<span class="tag-pill">story</span>'
                        }
                    </div>
                </div>
            </div>
            <div class="mt-4 space-y-2 text-sm text-stone-600">
                <p><strong>Situation:</strong> ${escapeHtml(story.situation || '—')}</p>
                <p><strong>Task:</strong> ${escapeHtml(story.task || '—')}</p>
                <p><strong>Action:</strong> ${escapeHtml(story.action || '—')}</p>
                <p><strong>Result:</strong> ${escapeHtml(story.result || '—')}</p>
            </div>
        </div>
      `
    )
    .join('');
}
