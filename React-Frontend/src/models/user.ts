export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string; // server-generated, e.g. "jd4821"
    email: string;    // unique per user
    // never include password
  }