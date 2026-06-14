import { TimerContainer } from './TimerContainer'

export default function TimerPage() {
  return (
    <div className="max-w-[800px] mx-auto px-container-padding-mobile py-stack-gap-md pb-32 flex flex-col items-center">
      <section className="mb-10 text-center">
        <h1 className="font-headline text-headline-xl text-primary mb-2">Timer</h1>
        <p className="font-body text-body-md text-secondary">
          No seu ritmo. Sem pressa.
        </p>
      </section>

      <TimerContainer />
    </div>
  )
}
