import CalInline from "@/components/CalInline";

const Book = () => (
  <div className="min-h-screen bg-background">
    <main className="prism-container pt-24 pb-16 mx-auto max-w-5xl">
      <h1 className="prism-heading-lg text-primary mb-4 text-center">Book with Daniel</h1>
      <p className="prism-body text-muted-foreground text-center mb-8">
        All offerings. Live availability. No redirects.
      </p>
      <div>
        <CalInline calLink="daniel-speiss" />
      </div>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Bookings are processed securely via Cal.com; availability updates live.
      </p>
    </main>
  </div>
);

export default Book;
