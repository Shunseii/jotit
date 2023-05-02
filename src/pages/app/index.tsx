import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NoteSlideOver } from "~/components/NoteSlideOver";
import { LoadingPage } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type Note } from "@prisma/client";
import { useSwipe } from "~/hooks/useSwipe";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import { NotificationListItem } from "~/components/CustomToaster";
import { useAtom } from "jotai";
import { type Queue } from "~/utils/queue";
import { atomWithImmer } from "jotai-immer";

type APICall = () => void;

export const apiQueueAtom = atomWithImmer(new Map<string, Queue<APICall>>());

const AppPage: NextPage = () => {
  const [apiQueue, setApiQueue] = useAtom(apiQueueAtom);
  const router = useRouter();
  const [parent] = useAutoAnimate();
  const ctx = api.useContext();
  const { isSignedIn, isLoaded } = useUser();
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      setIsCreateNoteModalOpen(true);
    },
    onSwipedRight: () => {
      setIsCreateNoteModalOpen(false);
    },
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const { data: notesData, isFetching: isFetchingNotes } =
    api.note.getAll.useQuery();

  const { mutate: deleteNote } = api.note.delete.useMutation({
    onMutate: async (note) => {
      await ctx.note.getAll.cancel();

      const previousNotes = ctx.note.getAll.getData();

      ctx.note.getAll.setData(
        undefined,
        (oldNotes) =>
          oldNotes?.filter((oldNote) => oldNote.id !== note.id) ?? []
      );

      toast.custom((t) => (
        <NotificationListItem toast={t}>
          <div className="ml-3 flex w-0 flex-1 justify-between pt-0.5">
            <p className="line-clamp-3 text-sm font-medium text-gray-900 dark:text-gray-50">
              Note deleted
            </p>

            {/* TODO: implement undo functionality */}
            <button
              type="button"
              className="ml-3 flex-shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-transparent"
            >
              Undo
            </button>
          </div>
        </NotificationListItem>
      ));

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(undefined, context?.previousNotes ?? []);

      toast.error("There was an error deleting your note :(");
      console.error("Error deleting note: ", err);
    },

    onSuccess: async (deletedNote) => {
      await ctx.note.getAll.cancel();

      ctx.note.getAll.setData(undefined, (oldNotes) =>
        oldNotes
          ? oldNotes.filter((oldNote) => oldNote.id !== deletedNote.id)
          : []
      );
    },
  });

  useEffect(() => {
    if (selectedNote) {
      setIsCreateNoteModalOpen(true);
    }
  }, [selectedNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const alphanumericRegex = /^[0-9a-zA-Z-+*]$/;

      if (
        alphanumericRegex.test(e.key) &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey &&
        !isCreateNoteModalOpen
      ) {
        setSelectedNote(null);
        setIsCreateNoteModalOpen(true);
      }
    };

    document.body.addEventListener("keyup", handleKeyDown);
    document.body.addEventListener("touchend", swipeHandlers.onTouchEnd);
    document.body.addEventListener("touchmove", swipeHandlers.onTouchMove);
    document.body.addEventListener("touchstart", swipeHandlers.onTouchStart);

    return () => {
      document.body.removeEventListener("keyup", handleKeyDown);
      document.body.removeEventListener("touchend", swipeHandlers.onTouchEnd);
      document.body.removeEventListener("touchmove", swipeHandlers.onTouchMove);
      document.body.removeEventListener(
        "touchstart",
        swipeHandlers.onTouchStart
      );
    };
  }, [isCreateNoteModalOpen, swipeHandlers]);

  useEffect(() => {
    if (!isSignedIn) {
      void router.push("/sign-up");
    }
  }, [isSignedIn, router]);

  if (!isLoaded || (isFetchingNotes && !notesData)) return <LoadingPage />;

  return (
    <>
      <main className="m-4 flex flex-col xl:ml-[300px]">
        {!notesData?.length ? (
          <div className="mx-auto w-max border border-dashed border-gray-300 bg-white px-32 py-6 text-center dark:border-white/20 dark:bg-gray-900">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-500" />

            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
              No notes
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by jotting down a note.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsCreateNoteModalOpen(true);
                }}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
              >
                <PlusIcon
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  aria-hidden="true"
                />
                New Note
              </button>
            </div>
          </div>
        ) : (
          <div ref={parent} className="grid grid-cols-fill-xs gap-3">
            {notesData.map((note) => (
              <button
                key={note.renderId}
                onClick={() => {
                  setSelectedNote(note);
                }}
                className="flex flex-col rounded-lg border border-yellow-400 bg-white text-start dark:border-yellow-200 dark:bg-gray-900 dark:text-white"
              >
                <div className="flex w-full items-center justify-between rounded-t bg-yellow-400 px-2 py-1 dark:bg-yellow-200">
                  <h2 className="font-sans text-sm font-semibold text-yellow-700 dark:text-yellow-800">
                    {/* TODO: Title here */}
                  </h2>

                  <span
                    title="Delete this note"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();

                      if (apiQueue.has(note.id)) {
                        setApiQueue((draftMap) => {
                          const queue = draftMap.get(note.id);
                          if (queue) {
                            queue.enqueue(() => deleteNote({ id: note.id }));
                          }
                        });
                      } else {
                        deleteNote({ id: note.id });
                      }
                    }}
                  >
                    <XMarkIcon className="h-5 w-5 fill-yellow-700 dark:text-yellow-800" />
                  </span>
                </div>

                <div className="m-2 line-clamp-[8] whitespace-pre-line text-start font-sans text-sm">
                  {note.content}
                </div>
              </button>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setIsCreateNoteModalOpen(true);
          }}
          className="fixed bottom-12 right-12 rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
        >
          <PlusIcon className="h-7 w-7" aria-hidden="true" />
        </button>

        <NoteSlideOver
          defaultNote={selectedNote}
          isOpen={isCreateNoteModalOpen}
          onClose={() => {
            setIsCreateNoteModalOpen(false);
            setSelectedNote(null);
          }}
        />
      </main>
    </>
  );
};

export default AppPage;
