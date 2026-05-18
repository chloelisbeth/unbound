/**
 * lib/blog-articles.js
 * Owns: all blog article data — slugs, metadata, content
 * Does NOT own: routing, rendering, or database access
 *
 * Content is stored in-memory as HTML strings — no DB needed.
 * Each article has: slug, title, metaTitle, metaDescription, publishedDate, content (HTML)
 */

const articles = [
  {
    slug: 'how-to-stop-people-pleasing',
    title: 'How to Stop People-Pleasing: The Science Behind Why You Can\'t Just "Stop"',
    metaTitle: 'How to Stop People-Pleasing: Why Willpower Doesn\'t Work | Unbound',
    metaDescription: 'You\'ve tried to stop people-pleasing. You\'ve told yourself to say no more, to stop shrinking. It hasn\'t worked. Here\'s why — and what actually changes the pattern.',
    publishedDate: 'May 2026',
    excerpt: 'You\'ve told yourself to just stop. To set a boundary. To say no. But the moment it matters, you fold. Here\'s why willpower can\'t fix a neural pathway — and what actually rewires the habit.',
    readTime: '7 min read',
    content: `
<p>You've tried to stop. You've had the conversation with yourself — the one where you say, firmly, <em>I need to stop doing this. I need to put myself first.</em> And then something happens. Someone asks a favor. A conflict flickers. And you fold, again, almost before you've noticed.</p>

<p>It's not that you forgot your resolution. It's not a willpower problem. The reason people-pleasing is so hard to stop is neurological, not motivational.</p>

<h2>Your Brain Learned This on Purpose</h2>

<p>People-pleasing is a skill your nervous system developed, probably early. In a childhood home where tension was unpredictable, or in a relationship where your needs created problems, your brain learned a very efficient lesson: <em>Make them okay, and you'll be okay.</em></p>

<p>That's not dysfunction. That's adaptation. Your amygdala, the part of your brain that scans for threat, learned to file away "other person's mood deteriorating" as danger. And it learned that the fastest exit from that danger was to smooth things over, shrink yourself, say yes.</p>

<p>Over thousands of repetitions, this became a habit. Not a conscious habit, like deciding to take a specific route home. A deep-groove habit — the kind that fires before conscious thought catches up. Neuroscientists call it a <strong>conditioned neural pathway</strong>. The trigger hits, the pathway fires, the behavior follows. You didn't decide to people-please. You just found yourself doing it.</p>

<h2>Why "Just Stop" Doesn't Work</h2>

<p>The part of your brain running the habit doesn't take instructions from the part making resolutions.</p>

<p>Your prefrontal cortex — the deliberate, planning, resolution-making part — is offline in the moments that matter most. When someone expresses disappointment, when a conflict is forming, when you feel someone pulling away — your threat response activates, and the old pathway runs. The prefrontal cortex doesn't get a vote.</p>

<p>This is why <strong>insight alone doesn't create change.</strong> You can completely understand that you're a people-pleaser, have read every book about it, know exactly why you do it — and still fold when it counts. Understanding the pattern and changing the pattern are two different neurological events. The first is cognitive. The second is behavioral, repeated, and slow.</p>

<h2>The Habit Loop Running the Show</h2>

<p>Every habit — including people-pleasing — runs on a three-part loop: <strong>cue, routine, reward.</strong></p>

<p>The <strong>cue</strong> is the trigger: someone's tone shifts, you sense disapproval, a request is made, silence follows something you said.</p>

<p>The <strong>routine</strong> is the behavior: you apologize, you agree, you minimize your opinion, you offer to fix something that isn't yours to fix.</p>

<p>The <strong>reward</strong> is the relief. The tension drops. They seem okay. The threat dissolves. And your brain logs: <em>That worked. Do that again.</em></p>

<p>The reward is real and it's immediate. That's what makes the loop sticky. You're not rewarded for boundary-setting with immediate relief — often it's the opposite. So the nervous system keeps betting on the old pattern, because the old pattern has a proven track record.</p>

<h2>What Actually Changes a Neural Pathway</h2>

<p>Neural pathways aren't permanent. The brain rewires at any age, given the right kind of repetition. What rewires a habit is <em>different behavior in the same context</em>, done enough times to build a competing pathway.</p>

<p>So the actual work of stopping people-pleasing isn't a mindset shift. It's behavioral:</p>

<h3>1. Interrupt before the loop completes</h3>

<p>You can't prevent the cue from hitting. But you can insert a pause between the cue and the routine. Even a two-second pause — one breath, one small delay — gives the prefrontal cortex enough time to come back online. This is the mechanism behind almost every effective people-pleasing intervention: not eliminating the urge, but creating space before acting on it.</p>

<h3>2. Tolerate the discomfort without resolving it immediately</h3>

<p>The discomfort you feel when you don't immediately smooth things over — that's not a signal that you're doing something wrong. It's withdrawal. Your nervous system was trained to make that feeling go away fast. Learning to sit in it, for even longer each time, is the actual work. The discomfort becomes more tolerable every time you don't flee it.</p>

<h3>3. Build the new association deliberately</h3>

<p>Each time you hold a boundary, name a need, or let someone be disappointed without fixing it — and notice that you survived — your brain begins to update its threat model. Slowly. Over many repetitions. The new pathway doesn't overwrite the old one; it competes with it. Eventually, if you feed it enough, it wins more often.</p>

<h2>It's Not Your Fault. But It Is Your Work.</h2>

<p>People-pleasing often develops in environments where it was genuinely necessary. You didn't choose the adaptations your nervous system made. But you're an adult now, and you get to decide what those adaptations are costing you — and whether you want to do the slow work of changing them.</p>

<p>That work isn't about willpower. It's about understanding the mechanism well enough to intervene in it, and doing that intervention enough times that a new pattern takes hold.</p>

<p>If any of this is landing, Module 1 of Unbound is the right place to start. Six lessons on recognizing the pattern. Free, no account required.</p>

<div class="article-internal-links">
  <p>Related reading: <a href="/blog/am-i-codependent">Am I Codependent? 7 Signs You're Losing Yourself in Relationships</a> · <a href="/blog/codependency-vs-being-a-good-person">Codependency vs. Being a Good Person</a></p>
</div>
    `.trim(),
  },

  {
    slug: 'am-i-codependent',
    title: 'Am I Codependent? 7 Signs You\'re Losing Yourself in Relationships',
    metaTitle: 'Am I Codependent? 7 Signs You\'re Losing Yourself | Unbound',
    metaDescription: 'Codependency isn\'t just about relationships with addicts. These 7 behavioral signs show what it actually looks like — and how to tell if it\'s happening to you.',
    publishedDate: 'May 2026',
    excerpt: 'Codependency isn\'t always obvious. It often looks like caring deeply, being a good partner, showing up for people. These 7 signs help you see when that caring is actually self-erasure.',
    readTime: '6 min read',
    content: `
<p>The word "codependent" has a lot of baggage. It showed up in addiction recovery literature in the 1980s to describe partners of alcoholics, and it's never fully shaken that origin. So when people google "am I codependent," they often expect to find themselves described as a doormat in a dysfunctional relationship.</p>

<p>But codependency is much more common than that, and much quieter. It doesn't always look like staying with someone who hurts you. It often looks like caring deeply, being reliably there for people, taking pride in being low-maintenance. It looks, from the outside, like a virtue.</p>

<p>What makes it codependency, rather than just caring, is what's happening underneath: <strong>whose needs you're tracking, whose feelings you're managing, and where your sense of self is located.</strong></p>

<p>These seven signs are behavioral, not about how you feel generally, but about what actually happens in your relationships. If three or more are familiar, it's worth sitting with that.</p>

<h2>1. You monitor other people's moods more closely than your own</h2>

<p>You walk into a room and your first instinct is to scan: What's the emotional temperature? Is someone upset? Is anyone pulling away? You're rarely sure how <em>you're</em> doing, but you almost always know how the people around you are doing.</p>

<p>That scanning isn't empathy, even though it feels like it. It's a threat-detection system. Other people's moods feel like information about your safety. When they're fine, you can relax. When they're not, you need to fix it.</p>

<h2>2. You apologize when you haven't done anything wrong</h2>

<p>Not as a nervous tic. As a genuine first instinct when conflict arises or someone seems upset with you. You say sorry to preempt their anger, or to dissolve the tension, or because you assume you must have done something. The apology comes before you've even figured out what happened.</p>

<p>This is one of the clearest markers because it shows the underlying logic: conflict is dangerous, and absorbing blame is the fastest exit.</p>

<h2>3. Your plans change based on other people's moods</h2>

<p>You intended to bring something up. You had decided to ask for something. But then you sensed a shift — they seemed tired, or a little distant, or not quite right — and you adjusted. You'll do it another time. You didn't want to add to whatever they were carrying.</p>

<p>This is self-erasure in real time. Your plans, your timing, your needs — all calibrated to their emotional state. The problem isn't consideration; it's that <em>your</em> needs have no protected space of their own.</p>

<h2>4. You find it very hard to say no — and when you do, you feel guilty</h2>

<p>Not just uncomfortable. Guilty. Like you've done something wrong. Like you've let someone down. Even when you know the request was unreasonable, even when you were already stretched — the guilt follows the no.</p>

<p>Your nervous system learned somewhere along the way that disappointing people is dangerous. The guilt is just the system enforcing an old rule: <em>make them okay, at any cost.</em></p>

<h2>5. You fix, rescue, or smooth things over — even when you aren't asked to</h2>

<p>Someone mentions a problem. You're already generating solutions. A friend is struggling; you take it on as something you need to fix. A relationship has friction; you are doing the emotional labor to resolve it, whether or not that's your role.</p>

<p>There's often a quiet righteousness here — a sense that you're the one who holds things together, who smooths things over, who keeps the peace. But it comes at a cost: it keeps you perpetually responsible for other people's experience.</p>

<h2>6. You lose track of what you actually want</h2>

<p>Asked where you want to go for dinner, you genuinely don't know. Not because you don't have preferences, but because you've spent so long prioritizing other people's preferences that yours have gone quiet. You've gotten so good at shaping yourself to fit that you've lost touch with what your own shape is.</p>

<p>This is one of the more disorienting symptoms — when the self-suppression has been thorough enough that there's no obvious thing to return to. You can't just "be yourself" when you've lost the thread of who that is.</p>

<h2>7. Your emotional state is largely determined by how other people treat you</h2>

<p>When someone is warm and approving, you feel good. When someone is cold or disappointed, you feel bad — not just interpersonally, but in yourself. Your self-worth isn't generated internally; it's loaned to you by how others are behaving toward you today.</p>

<p>This is sometimes called an external locus of control, but it goes deeper. Your <em>sense of self</em> is actually located outside yourself. It lives in how you're perceived, how you're needed, whether people are satisfied with you. When those signals turn cold, you go cold with them.</p>

<hr>

<h2>If 3+ of these resonate</h2>

<p>You're not broken. You're not permanently like this. These patterns usually have a clear origin — they were adaptive at some point. They developed in contexts where monitoring others and managing their moods was actually a reasonable survival strategy.</p>

<p>The question now is: what are they costing you, and do you want to change them?</p>

<p>Module 1 of Unbound covers exactly this ground: what the pattern is, where it comes from, what it looks like from the inside. It's free and takes about 45 minutes.</p>

<div class="article-internal-links">
  <p>Related reading: <a href="/blog/how-to-stop-people-pleasing">How to Stop People-Pleasing: Why Willpower Doesn't Work</a> · <a href="/blog/codependency-vs-being-a-good-person">Codependency vs. Being a Good Person</a></p>
</div>
    `.trim(),
  },

  {
    slug: 'codependency-vs-being-a-good-person',
    title: 'Codependency vs. Being a Good Person: How to Tell the Difference',
    metaTitle: 'Codependency vs. Being a Good Person: How to Tell the Difference | Unbound',
    metaDescription: 'There\'s a line between genuine caring and self-abandonment. Here\'s how to tell which side of it you\'re on — and why the distinction matters.',
    publishedDate: 'May 2026',
    excerpt: 'Codependency often looks exactly like virtue: empathy, selflessness, being there for others. The difference between caring and self-abandonment isn\'t always visible from the outside — but it\'s felt on the inside.',
    readTime: '6 min read',
    content: `
<p>If you're reading about codependency and thinking <em>but I just care about people</em>, that's almost always how it feels from the inside. Codependency rarely announces itself as self-neglect. It presents as love. As being a good partner, a loyal friend, a reliable daughter. As empathy.</p>

<p>That's what makes codependency so hard to recognize. The behaviors that characterize it — attentiveness to others' moods, willingness to help, difficulty with conflict — are the same behaviors we associate with being a good person.</p>

<p>So how do you tell the difference?</p>

<h2>The Question Isn't What You Do — It's Why</h2>

<p>The behaviors on the surface can look identical. A codependent person and a genuinely caring person might both bring soup to a sick friend, both listen for two hours to someone going through a breakup, both say "it's fine" when their own plans get disrupted.</p>

<p>What differs is the internal mechanism driving those actions.</p>

<p><strong>Genuine caring</strong> comes from surplus. You help because you have something to give, and giving it feels like a choice. If you couldn't help, you'd feel disappointed but not destabilized. Your sense of yourself doesn't depend on the outcome.</p>

<p><strong>Codependent caring</strong> comes from need. You help because not helping is intolerable. Because you're anxious when people are disappointed in you. Because your sense of self depends on being needed, being reliable, keeping the peace. It doesn't feel like a choice. It feels like a requirement.</p>

<p>Same action. Completely different internal experience.</p>

<h2>Four Questions to Tell Them Apart</h2>

<h3>1. Can you say no without guilt?</h3>

<p>Not discomfort — some discomfort with disappointing people is normal. Guilt. The kind where you feel like you've done something wrong by declining. Where you find yourself over-explaining and pre-apologizing and checking back in to make sure they're okay with your no.</p>

<p>Healthy caring allows for no. It allows for limits. When the no comes with crushing guilt — guilt that persists even when you know your limit was reasonable — that's a sign the caring is entangled with something else.</p>

<h3>2. Are you helping because you want to, or to manage your own anxiety?</h3>

<p>This one requires some honesty. When someone you care about is struggling and you jump in to fix it — what are you actually responding to? Their need, or your discomfort at watching them struggle?</p>

<p>Codependent helping has an anxious quality to it. You need the problem solved because their distress is activating yours. You can't sit with them in difficulty. You have to do something. That urgency isn't about them. It's about regulating yourself.</p>

<h3>3. Does your mood follow theirs?</h3>

<p>When they're happy, you feel okay. When they're upset — even about something that has nothing to do with you — you feel bad. Their emotional state lands on you and shapes your day.</p>

<p>Caring people feel <em>for</em> others. Codependent people feel <em>with</em> others, involuntarily, with little separation between their own emotional state and the person they're attached to. The permeability is the problem.</p>

<h3>4. Do you feel resentful — but keep going anyway?</h3>

<p>Resentment that you don't express, don't acknowledge, or feel guilty for having — this is one of the clearest markers. You're doing more than you want to, feeling worse than you let on, and continuing anyway because stopping feels worse.</p>

<p>Genuine caring doesn't accumulate resentment at the same rate. When you give freely, from choice, you don't build the same ledger. The resentment is the evidence that the giving was compelled, not chosen.</p>

<h2>Why the Distinction Matters</h2>

<p>If you call codependency just "caring a lot," you never address the part that's actually costly. The anxiety. The self-erasure. The loss of contact with your own needs and wants. The way your emotional life gets held hostage to other people's moods.</p>

<p>And you stay stuck in the paradox most people-pleasers eventually hit: you're doing everything right, you're kind, reliable, there for everyone, and you feel terrible. Because the kindness isn't coming from wholeness. It's coming from fear.</p>

<p>The goal isn't to care less. It's to care from a different place. From choice rather than compulsion. From abundance rather than anxiety. That's what actually changes when you address the pattern. Not the caring. The fear underneath it.</p>

<h2>Where to Start</h2>

<p>Recognition is the first step, and usually the hardest. Most people who figure out their codependency spent years convinced they were just a good person who cared too much. If you're sitting with some of this right now, that's the pattern starting to come into focus.</p>

<p>Module 1 of Unbound starts there. It's free, takes about 45 minutes, and covers the recognition phase: what the pattern actually is, where it comes from, how to see it clearly without beating yourself up.</p>

<div class="article-internal-links">
  <p>Related reading: <a href="/blog/how-to-stop-people-pleasing">How to Stop People-Pleasing: Why Willpower Doesn't Work</a> · <a href="/blog/am-i-codependent">Am I Codependent? 7 Signs You're Losing Yourself</a></p>
</div>
    `.trim(),
  },
];

/**
 * Returns all articles (for the index page).
 * @returns {Array}
 */
function getAllArticles() {
  return articles;
}

/**
 * Returns a single article by slug, or null if not found.
 * @param {string} slug
 * @returns {Object|null}
 */
function getArticleBySlug(slug) {
  return articles.find((a) => a.slug === slug) || null;
}

module.exports = { getAllArticles, getArticleBySlug };
