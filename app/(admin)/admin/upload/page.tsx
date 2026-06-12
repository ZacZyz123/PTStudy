import FileUpload from '@/components/admin/FileUpload'

export default function AdminUploadPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Upload lecture content</h1>
      <p className="mt-1 text-sm text-text-secondary">
        Drop a lecture file and Flex will generate a study guide, 15 flashcards, and a 10-question
        quiz automatically.
      </p>
      <div className="mt-6">
        <FileUpload />
      </div>
    </div>
  )
}
