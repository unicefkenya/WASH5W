
export interface Message {
    text: string; // e.g. 'i hope this works',
    from?: string; // e.g. 'you <username@your-email.com>',
    to: string; // e.g. 'someone <someone@your-email.com>, another <another@your-email.com>',
    cc?: string; // e.g. 'else <else@your-email.com>',
    subject: string; // e.g. 'testing emailjs',
}