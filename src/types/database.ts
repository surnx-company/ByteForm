export interface Database {
  public: {
    Tables: {
      forms: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          welcome_screen: {
            title: string;
            description?: string;
            buttonText: string;
          };
          thank_you_screen: {
            title: string;
            description?: string;
          };
          questions: Array<{
            id: string;
            type: string;
            title: string;
            description?: string;
            placeholder?: string;
            required: boolean;
            choices?: Array<{ id: string; label: string; value: string }>;
            min?: number;
            max?: number;
            maxFileSize?: number;
            acceptedFileTypes?: string[];
            conditionalLogic?: {
              questionId: string;
              operator: string;
              value: string;
            };
          }>;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          welcome_screen: Record<string, unknown>;
          thank_you_screen: Record<string, unknown>;
          questions: Record<string, unknown>[];
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          welcome_screen?: Record<string, unknown>;
          thank_you_screen?: Record<string, unknown>;
          questions?: Record<string, unknown>[];
          is_published?: boolean;
          updated_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          form_id: string;
          answers: Record<string, unknown>;
          started_at: string;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          answers: Record<string, unknown>;
          started_at: string;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          answers?: Record<string, unknown>;
          completed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
