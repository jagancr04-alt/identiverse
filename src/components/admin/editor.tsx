"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
export function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({ extensions: [StarterKit], content: value, immediatelyRender: false, onUpdate: ({ editor }) => onChange(editor.getHTML()), editorProps: { attributes: { "aria-label": "Page body rich text editor", role: "textbox", "aria-multiline": "true" } } });
  return <div className="rich-editor"><div className="editor-toolbar" role="toolbar" aria-label="Text formatting"><button type="button" aria-pressed={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()}><strong>B</strong></button><button type="button" aria-pressed={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()}><em>I</em></button><button type="button" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</button><button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()}>List</button><button type="button" onClick={() => editor?.chain().focus().undo().run()}>Undo</button></div><EditorContent editor={editor}/></div>;
}
