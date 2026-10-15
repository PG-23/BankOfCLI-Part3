
import type {ReactNode} from 'react';

// Props = the settings the parent passes into this component.
//"?" means the prop is optional
interface FormFieldProps{
    id:string;
    label:string;
    icon:string;
    value:string;
    onChange:(value:string) => void;
    onBlur?: () => void;
    placeholder?:string;
    helperText?:string;
    error?:string;
    rightSlot?:ReactNode;
    inputMode?:'text' | 'numeric' | 'decimal';
    maxLength?:number;
    required?:boolean;
    
}

export function FormField({
    id,label,icon,value,onChange,onBlur,placeholder,
    helperText,error,rightSlot,inputMode = 'text',maxLength,required}:FormFieldProps){

        // true when an error message was passed in, false when it's undefined or empty
        const hasError = Boolean(error);

         // id for the message below the input, so screen readers can link it to the input
        const messageId = `${id}-message`;

        return(
            <div className='flex flex-col gap-xs'>
                <label htmlFor={id} className='text-base font-medium text-text-main '>
                    {label}{required && '*'}
                </label>
                <div className={`flex items-center gap-sm rounded-sm border bg-surface px-md py-sm transition-colors focus-within:ring-2 ${
                    hasError
                    ? 'border-error focus-within:ring-error/20'
                    :'border-border focus-within:border-primary focus-within:ring-primary/20 '
                }`}
                >
                    <i className={`bi bi-${icon} ${hasError ? 'text-error': 'text-text-muted'}`} aria-hidden="true"/>
                    <input
                        id={id}
                        value={value}
                        onChange={e => onChange(e.target.value)}
                        onBlur={onBlur}
                        placeholder={placeholder}
                        inputMode={inputMode}
                        maxLength={maxLength}
                        required={required}
                        aria-invalid={hasError}
                        aria-describedby={messageId}
                        className="min-w-0 flex-1 bg-transparent text-base text-text-main outline-none placeholder:text-text-muted"
                    />
                    {rightSlot}


                </div>
                {(error || helperText) && (
                    <p id={messageId} role={hasError ? 'alert':undefined}
                    className={`text-small ${hasError ? 'text-error':'text-text-muted'}`}>
                        {error ?? helperText}
                    </p>
                )}
            </div>
        );

    }