import { Folder, Snippet, SnippetContent, Tag } from './index.d';

export interface IMedium {
  full_tags(): Promise<Tag[]>;
  full_folders(): Promise<Folder[]>;
  full_snippets(): Promise<Snippet[]>;

  get_tags(params?: URLSearchParams): Promise<Tag[]>;
  get_folders(params?: URLSearchParams): Promise<Folder[]>;
  get_snippets(params?: URLSearchParams): Promise<Snippet[]>;

  patch_tag(id: string, data: Partial<Tag>): Promise<Tag>;
  patch_folder(id: string, data: Partial<Folder>): Promise<Folder>;
  patch_snippet(id: string, data: Partial<Snippet>): Promise<Snippet>;
  patch_snippet_content(
    id: string,
    index: number,
    content: SnippetContent
  ): Promise<Snippet>;

  get_tags_map(
    params?: URLSearchParams,
    reverse?: boolean
  ): Promise<Record<string, string>>;
  get_folders_map(
    params?: URLSearchParams,
    reverse?: boolean
  ): Promise<Record<string, string>>;
  get_folders_pathes(params?: URLSearchParams): Promise<Record<string, string>>;

  match_tags(name: string): Promise<Tag[]>;
  match_folders(name: string): Promise<Folder[]>;
}
