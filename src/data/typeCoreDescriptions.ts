// Centralized PRISM type Core descriptions
// These match the Core sections from each individual type page

export interface TypeCoreDescription {
  title: string;
  paragraphs: string[];
}

export const TYPE_CORE_DESCRIPTIONS: Record<string, TypeCoreDescription> = {
  EII: {
    title: "Integrity Guide (Fi–Ne)",
    paragraphs: [
      "EIIs are empathetic idealists, characterized by introverted feeling (Fi) base and extroverted intuition (Ne) creative. Their Fi base is 4-dimensional, giving them a profound depth of inner values and a nuanced understanding of human emotions and ethics. As a \"plus\" ethics type, an EII's Fi seeks to expand understanding and harmony – they strive to find common principles, uplift others morally, and build bridges of mutual respect. EIIs often see the good in people or the potential for good, and they feel a strong sense of personal responsibility to act with integrity and kindness. This internal moral compass guides their decisions more than any external rulebook.",
      "Complementing this is Ne creative, a 3D function that allows EIIs to explore possibilities and ideas, but with a \"minus\" flavor – they tend to focus on refining possibilities, selecting the meaningful or realistic ones rather than a scattershot of random notions. This makes them insightful counselors or mentors: they can envision someone's latent talents or foresee pitfalls in a plan, gently steering toward the best outcome.",
      "In flow, an EII might resemble a compassionate sage or a counselor under a tree. They feel at home when helping people navigate life's choices in line with their authentic selves. They also enjoy intellectual pursuits that align with their values – literature, psychology, social activism – anything that expands understanding of the human condition and can be used for positive change. Their Fi Ne synergy means they often communicate through analogies and stories, enriching moral points with imaginative examples."
    ]
  },
  LII: {
    title: "Framework Architect (Ti–Ne)",
    paragraphs: [
      "LIIs are characterized by a Core of introverted logic (Ti) base and extroverted intuition (Ne) creative. Their Ti base is a 4D engine of analysis that seeks conceptual clarity and structural accuracy in everything. As a \"minus\" logic, LII's Ti focuses on refining and reducing ideas to their essentials – categorizing, defining, and removing inconsistencies (imagine a diligent architect of theories or a sage librarian sorting knowledge).",
      "They naturally form mental frameworks and principles to understand the world, relying on a vast store of learned information and internal rules. Supporting this is Ne creative, a 3D function that injects curiosity and breadth of imagination. LII's Ne is expansive and exploratory: they love contemplating theoretical possibilities, proposing alternate interpretations, and spotting latent potentials in a given system or person.",
      "In flow, a LII often resembles a thoughtful analyst or philosopher. They become wholly absorbed in problem-solving or learning – fitting pieces into a logical whole, while simultaneously entertaining innovative angles. The synergy of strong Ti and Ne means LIIs can be remarkably innovative thinkers: the Ti gives them rigor and depth, and the Ne allows them to think outside conventional bounds. They tend to enjoy complex intellectual challenges (puzzles, strategy, academic research) and often have a quietly confident command of their areas of expertise, even if they're modest about it."
    ]
  },
  ILE: {
    title: "Idea Catalyst (Ne–Ti)",
    paragraphs: [
      "ILEs are energetic innovators driven by extroverted intuition (Ne) base and introverted logic (Ti) creative. With Ne as a 4D base, the ILE's mind brims with expanding possibilities and ingenious connections. They constantly scan for the \"new\" – new theories, experiences, technologies, or angles – and delight in brainstorming and experimentation.",
      "This plus-oriented Ne produces incorrigible dreamers: ILEs often look beyond the horizon and propose ideas that others find bold or even far-fetched, yet they have an uncanny ability to envision which of these ideas carry positive potential at their core. Balancing this imaginative breadth is their Ti creative function, lending structure and logical coherence to their explorations. ILEs use Ti to categorize and systematize their myriad ideas, at least enough to explain or implement them.",
      "In a flow state, an ILE can be pictured as an inventive scientist or a hacker in the zone: intensely absorbed in chasing a concept, making rapid-fire associations, and solving theoretical puzzles, often losing track of time in the process. They thrive when their environment offers mental stimulation and when they have the freedom to jump between projects or lines of inquiry. Thanks to their strong functional dimensionality, ILEs are confident in both improvising on the fly and reasoning from first principles, which makes them remarkably adaptable thinkers."
    ]
  },
  ESE: {
    title: "Atmosphere Host (Fe–Si)",
    paragraphs: [
      "ESEs have a vibrant Core block defined by extroverted feeling (Fe) base and introverted sensing (Si) creative. Their 4D Fe base is tuned to the emotional atmosphere around them – they instinctively read and influence people's moods, often acting as the cheerleader or host in social settings. Because their Fe carries a \"minus\" overlay, ESEs emphasize harmonizing and smoothing over negative emotions.",
      "They excel at fostering comfort and enthusiasm in others, but do so in a practical, steady way rather than overwhelming drama. This pairs perfectly with their Si creative function, which is all about sensory well-being, familiarity, and positive experiences in the moment. Si as an expanding irrational element means ESEs joyfully create cozy, aesthetically pleasing environments and traditions – think of someone who remembers your favorite meal or organizes festive gatherings to make everyone feel at home.",
      "In their flow state, ESEs are like warm suns radiating encouragement: they deftly manage the social \"climate\" (Fe) while attending to tangible details that keep people comfortable and engaged (Si). Their high-dimensional Fe and Si give them a rich store of personal experience and cultural norms to draw upon, making them confident event organizers, counselors, or community builders who intuitively know just what gesture will brighten someone's day."
    ]
  },
  SEE: {
    title: "Relational Driver (Se–Fi)",
    paragraphs: [
      "SEEs are dynamic go-getters with a Core of extroverted sensing (Se) base and introverted feeling (Fi) creative. As a 4D base, Se gives SEEs a keen awareness of the present reality – they notice opportunities, resources, and power dynamics in their environment and are quick to act on them. Their Se comes with a \"plus\" charge, meaning it's an expanding, enterprising force.",
      "SEEs push boundaries and generate momentum: they'll initiate projects, galvanize people into action, and often take the lead in a very hands-on fashion. They thrive on excitement and visible progress – one can picture an SEE as the director who orchestrates events or the entrepreneur making bold moves in a market. Supporting this is Fi creative, which in their case provides a personal touch and moral compass to their use of power.",
      "Unlike a purely aggressive type, SEEs actually care about individual relationships and loyalties; their Fi allows them to charm others, build alliances, and align actions with heartfelt values (albeit selectively). As a \"minus\" Fi, they tend to have a discerning approach to friendship – they'll fiercely protect their inner circle and may show open skepticism or coldness to outsiders until trust is earned. In flow, an SEE is like a charismatic field commander or social influencer: confidently handling immediate challenges, negotiating on the fly, and infusing their interactions with personal warmth or flair."
    ]
  },
  LSI: {
    title: "Systems Marshal (Ti–Se)",
    paragraphs: [
      "LSIs are structured organizers with a Core of introverted logic (Ti) base and extroverted sensing (Se) creative. Their Ti base is 4-dimensional, giving them a strong grasp of systems, procedures, and logical relationships. As a \"plus\" Ti, LSI logic seeks to build comprehensive frameworks and establish clear, consistent rules – they're natural system administrators, whether in technology, law, or organizational management.",
      "Their Ti provides the intellectual backbone for understanding how things should work, while their Se creative adds practical implementation power. LSI Se is focused and purposeful rather than impulsive – it's about getting things done efficiently and maintaining standards through direct action. This combination makes them excellent at both designing systems and ensuring they're properly executed.",
      "In flow, an LSI resembles a competent administrator or technical lead: methodically working through complex procedures while maintaining attention to real-world constraints and deadlines. They excel in environments that value both intellectual rigor and practical results, often becoming the trusted authority others turn to when systems need to be built or fixed. Their Ti-Se combination gives them confidence in both theoretical understanding and hands-on problem-solving."
    ]
  },
  SLE: {
    title: "Tactical Commander (Se–Ti)",
    paragraphs: [
      "SLEs are action-oriented leaders with a Core of extroverted sensing (Se) base and introverted logic (Ti) creative. Their 4D Se base makes them supremely attuned to the immediate environment and power dynamics. As a \"minus\" Se, SLEs focus on tactical advantage and efficient resource utilization – they're natural competitors who thrive on challenges and direct confrontation.",
      "Their Se drives them to take decisive action and seize opportunities, while their Ti creative provides the analytical framework to make smart tactical decisions. SLE Ti is practical and results-oriented – it's about finding the most efficient path to victory rather than abstract theorizing. This combination makes them formidable in competitive environments and crisis situations.",
      "In flow, an SLE is like a battlefield commander or competitive athlete: fully present in the moment, reading the situation accurately, and making split-second decisions that others might hesitate over. They excel when there's a clear objective to achieve and obstacles to overcome, often inspiring others through their confidence and willingness to take calculated risks. Their Se-Ti partnership gives them both the courage to act and the wisdom to act effectively."
    ]
  },
  EIE: {
    title: "Inspiration Orchestrator (Fe–Ni)",
    paragraphs: [
      "EIEs are charismatic visionaries with a Core of extroverted feeling (Fe) base and introverted intuition (Ni) creative. Their 4D Fe base makes them natural orchestrators of human energy and emotion. As a \"plus\" Fe, EIEs seek to elevate and inspire others – they're drawn to grand narratives and meaningful causes that can unite people around shared values and aspirations.",
      "Their Fe provides the emotional intelligence to read and influence groups, while their Ni creative adds visionary depth and strategic timing. EIE Ni helps them see the deeper patterns and long-term implications of current events, allowing them to craft compelling narratives about where things are heading and why it matters. This combination makes them powerful speakers, leaders, and cultural influencers.",
      "In flow, an EIE resembles a great conductor or inspirational leader: orchestrating complex human dynamics while maintaining focus on a meaningful long-term vision. They excel in roles where they can move people toward important goals, whether through teaching, activism, or organizational leadership. Their Fe-Ni combination gives them both the emotional impact to inspire action and the foresight to choose worthy directions."
    ]
  },
  IEI: {
    title: "Vision Muse (Ni–Fe)",
    paragraphs: [
      "IEIs are contemplative visionaries with a Core of introverted intuition (Ni) base and extroverted feeling (Fe) creative. Their 4D Ni base gives them profound insight into time, potential, and hidden patterns. As a \"minus\" Ni, IEIs focus on distilling and refining their understanding of what's truly significant – they're natural philosophers and advisors who help others see the deeper meaning in events.",
      "Their Ni provides the contemplative depth to understand complex situations and long-term trends, while their Fe creative adds the ability to communicate these insights in ways that resonate with others emotionally. IEI Fe is gentle and supportive rather than commanding – it's about creating the right atmosphere for reflection and growth rather than driving immediate action.",
      "In flow, an IEI resembles a wise counselor or artistic muse: quietly observing the deeper currents of life and helping others connect with what's most meaningful. They excel in roles where they can guide others toward greater understanding and authenticity, whether through counseling, creative work, or spiritual guidance. Their Ni-Fe combination gives them both the depth to perceive hidden truths and the sensitivity to share them constructively."
    ]
  },
  LSE: {
    title: "Operations Steward (Te–Si)",
    paragraphs: [
      "LSEs are efficiency-focused managers with a Core of extroverted logic (Te) base and introverted sensing (Si) creative. Their 4D Te base makes them natural optimizers of processes and resources. As a \"plus\" Te, LSEs seek to expand and improve operational effectiveness – they're drawn to metrics, benchmarks, and systematic approaches that can scale successful methods.",
      "Their Te provides the drive to organize and optimize external systems, while their Si creative adds attention to quality, tradition, and sustainable practices. LSE Si values proven methods and incremental improvement rather than radical experimentation. This combination makes them excellent at building reliable, scalable operations that maintain high standards over time.",
      "In flow, an LSE resembles a competent operations manager or quality control expert: systematically improving processes while maintaining attention to detail and long-term sustainability. They excel in established organizations where they can apply their optimization skills to well-defined challenges. Their Te-Si combination gives them both the drive to improve efficiency and the wisdom to preserve what works well."
    ]
  },
  SLI: {
    title: "Practical Optimizer (Si–Te)",
    paragraphs: [
      "SLIs are quality-focused craftspeople with a Core of introverted sensing (Si) base and extroverted logic (Te) creative. Their 4D Si base gives them exquisite sensitivity to sensory experience, comfort, and practical quality. As a \"minus\" Si, SLIs focus on refining and perfecting existing approaches rather than pursuing novelty for its own sake – they're natural artisans who value doing things well over doing them quickly.",
      "Their Si provides deep attention to practical details and quality standards, while their Te creative adds the ability to organize and implement improvements systematically. SLI Te is focused and pragmatic rather than ambitious – it's about making things work better rather than building empires. This combination makes them excellent at hands-on problem-solving and quality improvement.",
      "In flow, an SLI resembles a master craftsperson or practical problem-solver: methodically working to perfect their craft while maintaining high standards for both process and outcome. They excel in roles where they can apply their technical skills to create tangible value, whether in manufacturing, service delivery, or hands-on problem-solving. Their Si-Te combination gives them both the sensitivity to perceive quality issues and the competence to address them effectively."
    ]
  },
  ESI: {
    title: "Boundary Guardian (Fi–Se)",
    paragraphs: [
      "ESIs are principled protectors with a Core of introverted feeling (Fi) base and extroverted sensing (Se) creative. Their 4D Fi base gives them strong personal values and loyalty to people and principles they care about. As a \"minus\" Fi, ESIs focus on protecting what's precious rather than expanding their circle of concern – they're natural guardians who will fiercely defend their people and principles against threats.",
      "Their Fi provides the moral compass and emotional depth to form strong loyalties, while their Se creative adds the practical power to defend what matters. ESI Se is protective and responsive rather than aggressive – it's about taking necessary action to maintain boundaries and protect what's important. This combination makes them reliable allies and formidable opponents when their values are challenged.",
      "In flow, an ESI resembles a loyal guardian or principled advocate: standing firmly for what they believe while taking practical action to protect what matters. They excel in roles where they can serve causes and people they care about, whether in advocacy, caregiving, or organizational loyalty. Their Fi-Se combination gives them both the conviction to know what's worth protecting and the courage to act on those convictions."
    ]
  },
  SEI: {
    title: "Comfort Harmonizer (Si–Fe)",
    paragraphs: [
      "SEIs are gentle nurturers with a Core of introverted sensing (Si) base and extroverted feeling (Fe) creative. Their 4D Si base gives them deep sensitivity to comfort, aesthetics, and the subtle details that make environments pleasant and harmonious. As a \"plus\" Si, SEIs seek to create and expand zones of comfort and well-being – they're natural hosts who notice what makes people feel at ease.",
      "Their Si provides the sensory awareness to create comfortable environments, while their Fe creative adds the social intelligence to harmonize relationships and maintain positive atmospheres. SEI Fe is gentle and supportive rather than dramatic – it's about maintaining harmony and helping others feel valued and included. This combination makes them excellent at creating spaces where people can relax and be themselves.",
      "In flow, an SEI resembles a gracious host or caring counselor: quietly attending to the details that make others comfortable while maintaining a warm, accepting atmosphere. They excel in roles where they can care for others and create pleasant environments, whether in hospitality, healthcare, or community building. Their Si-Fe combination gives them both the sensitivity to perceive what others need and the warmth to provide it generously."
    ]
  },
  ILI: {
    title: "Foresight Analyst (Ni–Te)",
    paragraphs: [
      "ILIs are strategic observers with a Core of introverted intuition (Ni) base and extroverted logic (Te) creative. Their 4D Ni base gives them exceptional ability to perceive long-term patterns and potential outcomes. As a \"plus\" Ni, ILIs seek to expand their understanding of how complex systems evolve over time – they're natural strategists who can see where current trends are heading.",
      "Their Ni provides the contemplative depth to understand complex situations and anticipate future developments, while their Te creative adds the analytical framework to make these insights practical and actionable. ILI Te is strategic and selective rather than broadly ambitious – it's about applying effort where it will have the most long-term impact. This combination makes them excellent advisors and strategic planners.",
      "In flow, an ILI resembles a strategic consultant or wise advisor: quietly analyzing complex situations and providing insights about long-term implications and optimal timing. They excel in roles where they can apply their foresight to important decisions, whether in planning, analysis, or advisory capacities. Their Ni-Te combination gives them both the vision to see what's coming and the judgment to know what should be done about it."
    ]
  },
  IEE: {
    title: "Possibility Connector (Ne–Fi)",
    paragraphs: [
      "IEEs are enthusiastic networkers with a Core of extroverted intuition (Ne) base and introverted feeling (Fi) creative. Their 4D Ne base makes them natural connectors who see potential and possibilities in people and situations. As a \"minus\" Ne, IEEs focus on discovering and developing the best possibilities rather than generating endless options – they're skilled at recognizing hidden potential and bringing it to light.",
      "Their Ne provides the curiosity and networking ability to discover opportunities and connections, while their Fi creative adds the personal values and relationship skills to build meaningful connections. IEE Fi is selective and authentic rather than universally accepting – it's about forming genuine connections based on shared values and mutual growth potential. This combination makes them excellent at bringing people and ideas together.",
      "In flow, an IEE resembles an inspiring connector or talent scout: enthusiastically discovering potential in people and situations while building networks of meaningful relationships. They excel in roles where they can help others discover and develop their potential, whether in coaching, business development, or community building. Their Ne-Fi combination gives them both the vision to see what's possible and the authenticity to build trust with others."
    ]
  },
  LIE: {
    title: "Strategic Executor (Te–Ni)",
    paragraphs: [
      "LIEs are results-oriented leaders with a Core of extroverted logic (Te) base and introverted intuition (Ni) creative. Their 4D Te base makes them natural optimizers who focus on achieving concrete results through efficient systems and clear metrics. As a \"minus\" Te, LIEs seek to streamline and focus efforts – they're skilled at cutting through complexity to identify what really matters for success.",
      "Their Te provides the drive to organize resources and people toward clear objectives, while their Ni creative adds strategic foresight and timing. LIE Ni helps them anticipate trends and position for future opportunities rather than just reacting to current conditions. This combination makes them excellent at building successful enterprises and leading organizational change.",
      "In flow, an LIE resembles a competent CEO or strategic leader: systematically building toward long-term goals while maintaining focus on measurable progress and practical results. They excel in competitive environments where they can apply their combination of strategic thinking and execution skills. Their Te-Ni partnership gives them both the drive to achieve results and the foresight to choose the right battles."
    ]
  }
}