// Editor Types for Visual Funnel Builder

export interface EditorElement {
  id: string
  type: ElementType
  content: Record<string, unknown>
  styles: ElementStyles
  settings: Record<string, unknown>
  children?: EditorElement[]
}

export type ElementType =
  | 'section'
  | 'row'
  | 'column'
  | 'heading'
  | 'text'
  | 'image'
  | 'video'
  | 'button'
  | 'form'
  | 'input'
  | 'select'
  | 'checkbox'
  | 'divider'
  | 'spacer'
  | 'countdown'
  | 'testimonial'
  | 'pricing'
  | 'faq'
  | 'popup'
  | 'html'

export interface ElementStyles {
  // Layout
  width?: string
  height?: string
  minHeight?: string
  maxWidth?: string
  margin?: string
  padding?: string
  display?: string
  flexDirection?: string
  justifyContent?: string
  alignItems?: string
  gap?: string

  // Background
  backgroundColor?: string
  backgroundImage?: string
  backgroundSize?: string
  backgroundPosition?: string
  backgroundRepeat?: string

  // Border
  borderWidth?: string
  borderStyle?: string
  borderColor?: string
  borderRadius?: string

  // Typography
  fontFamily?: string
  fontSize?: string
  fontWeight?: string
  lineHeight?: string
  letterSpacing?: string
  textAlign?: string
  color?: string

  // Effects
  boxShadow?: string
  opacity?: string
  transform?: string
  transition?: string

  // Custom
  [key: string]: string | undefined
}

export interface EditorState {
  elements: EditorElement[]
  selectedElement: string | null
  hoveredElement: string | null
  clipboard: EditorElement | null
  history: {
    past: EditorElement[][]
    future: EditorElement[][]
  }
  isDragging: boolean
  zoom: number
  devicePreview: 'desktop' | 'tablet' | 'mobile'
}

export interface DragItem {
  type: string
  id?: string
  elementType?: ElementType
  index?: number
}

export interface DropResult {
  parentId: string
  index: number
}

// Element Templates
export const ELEMENT_TEMPLATES: Record<ElementType, Omit<EditorElement, 'id'>> = {
  section: {
    type: 'section',
    content: {},
    styles: {
      width: '100%',
      padding: '40px 20px',
      backgroundColor: 'transparent',
    },
    settings: {},
    children: [],
  },
  row: {
    type: 'row',
    content: {},
    styles: {
      display: 'flex',
      flexDirection: 'row',
      gap: '20px',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    settings: {},
    children: [],
  },
  column: {
    type: 'column',
    content: {},
    styles: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    settings: {},
    children: [],
  },
  heading: {
    type: 'heading',
    content: {
      text: 'Add Your Heading Here',
      level: 'h2',
    },
    styles: {
      fontSize: '32px',
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
    },
    settings: {},
  },
  text: {
    type: 'text',
    content: {
      text: 'Add your text content here. Click to edit.',
    },
    styles: {
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#a0aec0',
    },
    settings: {},
  },
  image: {
    type: 'image',
    content: {
      src: '',
      alt: 'Image',
    },
    styles: {
      width: '100%',
      height: 'auto',
      borderRadius: '8px',
    },
    settings: {
      link: '',
      openInNewTab: false,
    },
  },
  video: {
    type: 'video',
    content: {
      url: '',
      type: 'youtube', // youtube, vimeo, wistia, custom
    },
    styles: {
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: '8px',
    },
    settings: {
      autoplay: false,
      controls: true,
      loop: false,
    },
  },
  button: {
    type: 'button',
    content: {
      text: 'Click Here',
    },
    styles: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      padding: '16px 32px',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: '600',
      textAlign: 'center',
    },
    settings: {
      link: '',
      action: 'link', // link, scroll, popup, submit
      openInNewTab: false,
    },
  },
  form: {
    type: 'form',
    content: {},
    styles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      width: '100%',
      maxWidth: '500px',
    },
    settings: {
      action: '',
      method: 'POST',
      redirectUrl: '',
    },
    children: [],
  },
  input: {
    type: 'input',
    content: {
      name: 'email',
      placeholder: 'Enter your email',
      label: 'Email',
      inputType: 'email',
    },
    styles: {
      padding: '12px 16px',
      borderRadius: '6px',
      border: '1px solid #374151',
      backgroundColor: '#1f2937',
      color: '#ffffff',
    },
    settings: {
      required: true,
    },
  },
  select: {
    type: 'select',
    content: {
      name: 'select',
      label: 'Select an option',
      options: [
        { value: '', label: 'Choose...' },
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ],
    },
    styles: {
      padding: '12px 16px',
      borderRadius: '6px',
      border: '1px solid #374151',
      backgroundColor: '#1f2937',
      color: '#ffffff',
    },
    settings: {
      required: false,
    },
  },
  checkbox: {
    type: 'checkbox',
    content: {
      name: 'checkbox',
      label: 'I agree to the terms and conditions',
    },
    styles: {},
    settings: {
      required: false,
    },
  },
  divider: {
    type: 'divider',
    content: {},
    styles: {
      height: '1px',
      backgroundColor: '#374151',
      margin: '20px 0',
    },
    settings: {},
  },
  spacer: {
    type: 'spacer',
    content: {},
    styles: {
      height: '40px',
    },
    settings: {},
  },
  countdown: {
    type: 'countdown',
    content: {
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      expiredText: 'Offer Expired',
    },
    styles: {
      fontSize: '48px',
      fontWeight: '700',
      color: '#ffffff',
      textAlign: 'center',
    },
    settings: {
      showDays: true,
      showHours: true,
      showMinutes: true,
      showSeconds: true,
    },
  },
  testimonial: {
    type: 'testimonial',
    content: {
      quote: 'This product changed my life!',
      author: 'John Doe',
      title: 'CEO, Company',
      avatar: '',
      rating: 5,
    },
    styles: {
      padding: '24px',
      backgroundColor: '#1f2937',
      borderRadius: '12px',
    },
    settings: {},
  },
  pricing: {
    type: 'pricing',
    content: {
      name: 'Pro Plan',
      price: 97,
      currency: 'USD',
      period: 'month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      buttonText: 'Get Started',
    },
    styles: {
      padding: '32px',
      backgroundColor: '#1f2937',
      borderRadius: '16px',
      textAlign: 'center',
    },
    settings: {
      highlighted: false,
      link: '',
    },
  },
  faq: {
    type: 'faq',
    content: {
      items: [
        { question: 'What is this product?', answer: 'Description here...' },
        { question: 'How does it work?', answer: 'Explanation here...' },
      ],
    },
    styles: {
      gap: '12px',
    },
    settings: {
      allowMultiple: false,
    },
  },
  popup: {
    type: 'popup',
    content: {
      trigger: 'click', // click, exit, delay, scroll
      delay: 5000,
      scrollPercentage: 50,
    },
    styles: {
      backgroundColor: '#111827',
      borderRadius: '16px',
      padding: '40px',
      maxWidth: '500px',
    },
    settings: {
      showOnce: true,
      overlayColor: 'rgba(0,0,0,0.7)',
    },
    children: [],
  },
  html: {
    type: 'html',
    content: {
      code: '<div>Custom HTML</div>',
    },
    styles: {},
    settings: {},
  },
}

// Element Categories for Sidebar
export const ELEMENT_CATEGORIES = [
  {
    name: 'Layout',
    elements: ['section', 'row', 'column', 'divider', 'spacer'],
  },
  {
    name: 'Content',
    elements: ['heading', 'text', 'image', 'video'],
  },
  {
    name: 'Interactive',
    elements: ['button', 'form', 'input', 'select', 'checkbox'],
  },
  {
    name: 'Advanced',
    elements: ['countdown', 'testimonial', 'pricing', 'faq', 'popup', 'html'],
  },
]
