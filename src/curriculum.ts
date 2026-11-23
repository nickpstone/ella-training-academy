export type Dimension = 'duration' | 'movement' | 'distance' | 'distraction'

export interface Exercise {
  id: string
  title: string
  description: string
  dimension: Dimension
  levels: readonly [string, string, string]
  steps: string[]
  criterion: string
  safety: string
  easier: string
}

export const weeks = [
  { title: 'Sit through movement', description: 'Help Ella keep her seat while you move.', exercises: [
    { id: 'shift', title: 'The weight shift', description: 'A tiny shift from you, a steady sit from Ella.', dimension: 'movement', levels: ['Small shoulder lean', 'Small weight shift', 'Full weight shift'], steps: ['Cue “Ella, Sit” once and reward the sit.', 'Make the selected movement, then return to neutral.', 'While Ella is seated, say “Yes!” and feed at her mouth. Say “Free!” and invite her to move.'], criterion: 'Ella stays seated through the movement and until “Free!”.', safety: 'Use a quiet room with a non-slip floor.', easier: 'Move only a shoulder or practise a rewarded sit with no movement.' },
    { id: 'foot', title: 'One little step', description: 'Build from lifting a heel to taking one step.', dimension: 'movement', levels: ['Lift one heel', 'Slide one foot', 'Take one side step'], steps: ['Set up a relaxed sit at arm’s reach.', 'Move one foot as described and return it to the start.', 'Mark and feed while she is still seated, then release with “Free!”.'], criterion: 'Ella remains seated through the whole movement and release sequence.', safety: 'Keep the step lateral and leave space around Ella’s paws.', easier: 'Go back to a weight shift.' },
  ] },
  { title: 'Duration & release', description: 'Make waiting and being released two clear skills.', exercises: [
    { id: 'release', title: 'Learn “Free!”', description: 'Give Ella a clear invitation to leave her sit.', dimension: 'duration', levels: ['1 second', '2 seconds', '3 seconds'], steps: ['Cue a sit, mark and feed while Ella sits.', 'Wait for the selected time, then say “Free!” once.', 'Invite Ella forward with your hand or a tossed treat after the cue.'], criterion: 'Ella stays seated for the interval and moves after the release cue.', safety: 'Toss treats only onto an unobstructed, non-slip surface.', easier: 'Release immediately after feeding and make the invitation clearer.' },
    { id: 'pause', title: 'A quiet pause', description: 'Stretch a comfortable sit by a few seconds.', dimension: 'duration', levels: ['3 seconds', '5 seconds', '8 seconds'], steps: ['Ask for a sit and keep your feet still.', 'Wait the selected interval, with an early reward if helpful.', 'Mark and feed while Ella sits, then say “Free!”.'], criterion: 'Ella holds the sit for the target interval until released.', safety: 'Keep the surface comfortable and end before Ella tires.', easier: 'Cut the hold to one or two seconds.' },
  ] },
  { title: 'Distance & stay', description: 'Step away briefly and come back to reward.', exercises: [
    { id: 'back', title: 'Step away and return', description: 'Practise a predictable return before rewarding.', dimension: 'distance', levels: ['Half a step', 'One step', 'Two steps'], steps: ['Cue a sit with Ella facing you.', 'Step directly back the selected distance and immediately return.', 'Say “Yes!” and feed once you’re back and she is still seated. Then release.'], criterion: 'Ella sits through your departure and return, until “Free!”.', safety: 'Keep her in sight in an enclosed room.', easier: 'Rock back without taking a step.' },
    { id: 'angle', title: 'A step on an angle', description: 'Visit a new angle with the same quick return.', dimension: 'distance', levels: ['Half a diagonal step', 'One diagonal step', 'Two diagonal steps'], steps: ['Set up a sit.', 'Step diagonally the selected distance and return without pausing.', 'Mark and feed in position, then release.'], criterion: 'Ella stays seated as your angle changes and until release.', safety: 'Stay in view and clear furniture from your path.', easier: 'Shorten the diagonal step or revisit the straight approach.' },
  ] },
  { title: 'Touch & recall', description: 'Make coming to you the best part of the game.', exercises: [
    { id: 'touch', title: 'Find my hand', description: 'Turn her familiar Touch into a little search game.', dimension: 'distance', levels: ['Hand 10 cm away', 'Hand 25 cm away', 'Hand 50 cm away'], steps: ['Present an open palm at nose height.', 'Say “Touch” once when Ella can see your hand.', 'Mark the nose contact with “Yes!” and deliver a treat. Reset between reps.'], criterion: 'Ella reaches your palm and touches it with her nose after one cue.', safety: 'Keep your hand low and give Ella room to choose to approach.', easier: 'Present the palm closer and straight ahead.' },
    { id: 'recall', title: 'Come and Touch', description: 'Use her hand target as an inviting finish to recall.', dimension: 'distance', levels: ['1 metre', '2 metres', '3 metres'], steps: ['Set up in an enclosed room with Ella loosely facing you.', 'From the selected distance say “Ella, come!” once, then offer your hand as she approaches.', 'Mark and generously reward arrival at your hand. Let her reset before trying again.'], criterion: 'Ella comes all the way to your hand after one recall cue.', safety: 'Use an enclosed area. Practise away from traffic and open doors.', easier: 'Start right beside her and reward a single step toward you.' },
  ] },
  { title: 'Down, Place & settle', description: 'Build comfortable ways for Ella to relax.', exercises: [
    { id: 'down', title: 'Find a Down', description: 'Reward elbows on the floor and a soft body.', dimension: 'duration', levels: ['Elbows touch', '2 seconds down', '4 seconds down'], steps: ['Guide a treat from nose height to the floor. Add “Down” before the gesture once she reliably follows it.', 'When her elbows reach the floor, hold for the selected interval.', 'Mark and feed low while she is down, then say “Free!”.'], criterion: 'Both elbows reach the floor and stay there through the target interval.', safety: 'Use a soft surface and let Ella choose the movement.', easier: 'Reward a head dip or elbow bend toward the floor.' },
    { id: 'place', title: 'Settle on a mat', description: 'Make the mat a comfortable place to choose.', dimension: 'duration', levels: ['All paws on mat', '3 seconds on mat', '6 seconds on mat'], steps: ['Put down a non-slip mat and reward Ella for stepping onto it.', 'When she reliably steps on, say “Place” just before she approaches.', 'Feed calmly on the mat and reward relaxed posture through the selected interval. Release with “Free!”.'], criterion: 'Ella places all paws on the mat and stays for the target time.', safety: 'Use a stable mat away from foot traffic and allow Ella to leave.', easier: 'Reward looking at the mat or placing one paw on it.' },
  ] },
  { title: 'Real-life practice', description: 'Carry familiar skills into carefully chosen situations.', exercises: [
    { id: 'room', title: 'Same sit, new context', description: 'Revisit an easy sit with one change in the room.', dimension: 'distraction', levels: ['Quiet familiar room', 'Quiet second room', 'Second room with a still toy'], steps: ['Choose the selected setup and cue a familiar easy sit.', 'Keep your feet still and wait one second.', 'Mark and reward in the sit, then release with “Free!”.'], criterion: 'Ella responds once and holds the easy sit until released.', safety: 'Use a low-value toy and give Ella space to disengage.', easier: 'Remove the toy or return to the familiar room.' },
    { id: 'visitor', title: 'Calm with a helper', description: 'Keep mat work easy while a familiar person is nearby.', dimension: 'distraction', levels: ['Empty room', 'Seated helper', 'Helper gently shifts in chair'], steps: ['Keep the mat in its familiar spot and have the helper stay several metres away.', 'Cue Place once and reward a short, calm settle.', 'Release before Ella grows restless. Ask the helper to remain neutral.'], criterion: 'Ella chooses her mat and stays for three relaxed seconds.', safety: 'Use a familiar helper and stop if Ella shows worry or overexcitement.', easier: 'Ask the helper to stay still or leave the room.' },
  ] },
] satisfies ReadonlyArray<{ title: string; description: string; exercises: Exercise[] }>

export const exercises: Exercise[] = weeks.flatMap<Exercise>(week => week.exercises)
