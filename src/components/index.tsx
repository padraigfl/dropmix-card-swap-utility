import { ReactElement, ReactNode, useState } from "react"
import { createPortal } from "react-dom";


const Dialog = (props: { children: ReactNode, onClose: () => void }) => {
  return createPortal(
    <div className="dialog">
      <button onClick={props.onClose}>Close</button>
      { props.children }
    </div>,
    document.getElementById('modalPortal')!
  )
}

interface DialogProps {
  children: (setOpen: any) => ReactNode;
  buttonText?: string;
  buttonElement?: ReactElement | string;
}

export const DialogControl = (props: DialogProps) => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>{props.buttonText || 'Open'}</button>
      { isOpen && (
        <Dialog onClose={() => setOpen(false)}>
          { props.children(() => setOpen(false)) }
        </Dialog>
      )}
    </>
  )
}