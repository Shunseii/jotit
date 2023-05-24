import { type Note } from "@prisma/client";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { motion } from "framer-motion";
import { type FC } from "react";

interface NoteDisplayProps
  extends Omit<
    Note,
    "userId" | "updatedAt" | "deletedAt" | "createdAt" | "id"
  > {
  onSelectNote: () => void;
  onDeleteNote: () => void;
}

export const NoteDisplay: FC<NoteDisplayProps> = ({
  title,
  content,
  renderId,
  onDeleteNote,
  onSelectNote,
}) => {
  return (
    <motion.button
      key={renderId}
      layout="position"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      onClick={(e) => {
        e.stopPropagation();

        onSelectNote();
      }}
      className="flex flex-col rounded-lg border border-yellow-400 bg-white text-start dark:border-yellow-200 dark:bg-gray-900 dark:text-white"
    >
      <div className="flex w-full items-start justify-between rounded-t bg-yellow-400 px-2 py-1 dark:bg-yellow-200">
        <h2 className="line-clamp-2 font-sans text-sm font-semibold text-yellow-700 dark:text-yellow-800">
          {title ?? ""}
        </h2>

        <span
          title="Delete this note"
          className="cursor-pointer"
          tabIndex={0}
          onKeyDown={(e) => {
            e.stopPropagation();

            if (e.key === "Enter") {
              e.preventDefault();

              onDeleteNote();
            }
          }}
          onClick={(e) => {
            e.stopPropagation();

            onDeleteNote();
          }}
        >
          <XMarkIcon className="h-5 w-5 fill-yellow-700 dark:text-yellow-800" />
        </span>
      </div>

      {/* TODO: fix this w-[96%] hack to make break-words work */}
      <div className="m-2 line-clamp-[8] w-[96%] whitespace-pre-line break-words text-start font-sans text-sm">
        {content}
      </div>
    </motion.button>
  );
};
