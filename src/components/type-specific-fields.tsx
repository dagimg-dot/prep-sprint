import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import type { TestType } from '@/types'

interface TypeSpecificFieldsProps {
  testType: TestType
  testLink: string
  writingTask1: string
  writingTask2: string
  audioFileName: string
  onTestLinkChange: (v: string) => void
  onWritingTask1Change: (v: string) => void
  onWritingTask2Change: (v: string) => void
  onAudioFileChange: (name: string) => void
}

export function TypeSpecificFields(props: TypeSpecificFieldsProps) {
  switch (props.testType) {
    case 'listening':
    case 'reading':
      return <LinkFields {...props} />
    case 'writing':
      return <WritingFields {...props} />
    case 'speaking':
      return <SpeakingFields {...props} />
  }
}

function LinkFields({ testLink, onTestLinkChange }: TypeSpecificFieldsProps) {
  return (
    <Input
      placeholder="Test link (URL)"
      type="url"
      value={testLink}
      onChange={(e) => onTestLinkChange(e.target.value)}
    />
  )
}

function WritingFields({
  writingTask1,
  writingTask2,
  testLink,
  onWritingTask1Change,
  onWritingTask2Change,
  onTestLinkChange,
}: TypeSpecificFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Task 1 <span className="text-xs">(150+ words — describe the visual)</span>
        </p>
        <Textarea
          placeholder="Paste or type your Task 1 response..."
          value={writingTask1}
          onChange={(e) => onWritingTask1Change(e.target.value)}
          rows={6}
        />
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Task 2 <span className="text-xs">(250+ words — essay)</span>
        </p>
        <Textarea
          placeholder="Paste or type your Task 2 response..."
          value={writingTask2}
          onChange={(e) => onWritingTask2Change(e.target.value)}
          rows={8}
        />
      </div>
      <Input
        placeholder="Link to prompt (optional)"
        type="url"
        value={testLink}
        onChange={(e) => onTestLinkChange(e.target.value)}
      />
    </div>
  )
}

function SpeakingFields({
  audioFileName,
  testLink,
  onAudioFileChange,
  onTestLinkChange,
}: TypeSpecificFieldsProps) {
  const handleClick = () => {
    const fakeName = `speaking-recording-${Date.now()}.webm`
    onAudioFileChange(fakeName)
    console.log('[upload stub]', fakeName)
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">
          Audio recording
        </p>
        <p className="text-xs text-muted-foreground">
          Record yourself answering the questions (all 3 parts in one file).
        </p>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleClick}
        >
          {audioFileName ? (
            <>Replace recording...</>
          ) : (
            <>Upload recording...</>
          )}
        </Button>
        {audioFileName && (
          <p className="text-xs text-emerald-400">
            Uploaded: {audioFileName}
          </p>
        )}
      </div>
      <Input
        placeholder="Test link (URL)"
        type="url"
        value={testLink}
        onChange={(e) => onTestLinkChange(e.target.value)}
      />
    </div>
  )
}
