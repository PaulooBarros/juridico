'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading2, Undo2, Redo2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  content: any
  onChange: (content: any) => void
}

export function ModeloEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content && Object.keys(content).length > 0 ? content : '<p></p>',
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    editorProps: {
      attributes: {
        class: 'modelo-editor-content outline-none min-h-[320px] p-4 text-[13px]',
      },
    },
  })

  if (!editor) return null

  return (
    <div className="border border-input rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b bg-muted/30 flex-wrap">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrito (Ctrl+B)">
          <Bold size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Itálico (Ctrl+I)">
          <Italic size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título">
          <Heading2 size={13} />
        </Btn>
        <div className="w-px h-4 bg-border mx-1" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista">
          <List size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={13} />
        </Btn>
        <div className="w-px h-4 bg-border mx-1" />
        <Btn onClick={() => editor.chain().focus().undo().run()} active={false} title="Desfazer (Ctrl+Z)">
          <Undo2 size={13} />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} active={false} title="Refazer (Ctrl+Y)">
          <Redo2 size={13} />
        </Btn>
        <div className="ml-auto text-[10px] text-muted-foreground hidden sm:block">
          Use{' '}
          <code className="font-mono bg-muted px-1 py-0.5 rounded text-[9px]">
            {'{{variavel}}'}
          </code>{' '}
          para campos dinâmicos
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}

function Btn({
  children, onClick, active, title,
}: {
  children: React.ReactNode
  onClick: () => void
  active: boolean
  title: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded text-muted-foreground transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-accent hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
