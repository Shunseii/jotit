import { useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NoteSlideOver } from "~/components/NoteSlideOver";
import { LoadingPage } from "~/components/LoadingSpinner";
import { api } from "~/utils/api";
import { DocumentTextIcon, PlusIcon } from "@heroicons/react/24/outline";
import { type Note } from "@prisma/client";
import { useSwipe } from "~/hooks/useSwipe";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { toast } from "react-hot-toast";
import { NotificationListItem } from "~/components/CustomToaster";
import { atom, useAtom } from "jotai";
import { atomWithImmer } from "jotai-immer";
import { motion, AnimatePresence } from "framer-motion";
import { useTimeoutEffect } from "@react-hookz/web";
import { isSidebarOpenAtom, searchInputAtom } from "~/components/Layout";
import { useHotkeys } from "react-hotkeys-hook";
import { getAlphanumericCharacters } from "~/utils/hotkeys";
import { useIsMutating } from "@tanstack/react-query";
import { MutationQueue } from "~/utils/queue";

export type GetAllNotesInput = Parameters<typeof api.note.getAll.useQuery>[0];

export const noteMutationQueuesAtom = atomWithImmer(
  new Map<string, MutationQueue>()
);
export const slideoverInputAtom = atom("");
export const isCapturingInputAtom = atom(true);
export const isTypeHotkeyEnabledAtom = atom(true);

const AppPage: NextPage = () => {
  const isMutating = useIsMutating();
  const [isSidebarOpen, setIsSidebarOpen] = useAtom(isSidebarOpenAtom);
  const [isTypeHotkeyEnabled, setIsTypeHotkeyEnabled] = useAtom(
    isTypeHotkeyEnabledAtom
  );
  const [noteMutationQueues, setNoteMutationQueues] = useAtom(
    noteMutationQueuesAtom
  );
  const [, setSlideoverInput] = useAtom(slideoverInputAtom);
  const [isCapturingInput] = useAtom(isCapturingInputAtom);
  const router = useRouter();
  const ctx = api.useContext();
  const { isSignedIn, isLoaded } = useUser();
  const [isCreateNoteModalOpen, setIsCreateNoteModalOpen] = useState(false);
  const [searchInput] = useAtom(searchInputAtom);
  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (!isSidebarOpen) {
        setIsCreateNoteModalOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    },
    onSwipedRight: () => {
      setIsCreateNoteModalOpen(false);
    },
  });
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [, reset] = useTimeoutEffect(() => {
    setIsTypeHotkeyEnabled(true);
  }, 500);

  const getAllNotesQueryInputs: GetAllNotesInput = {
    searchKeyword: searchInput || undefined,
  };

  const {
    data: notesData,
    isFetching: isFetchingNotes,
    isLoading: isLoadingNotes,
  } = api.note.getAll.useQuery(getAllNotesQueryInputs);

  const { mutateAsync: undoDelete } = api.note.undoDelete.useMutation({
    onMutate: () => {
      // TODO: use correct previous state
      const previousNotes = ctx.note.getAll.getData(getAllNotesQueryInputs);

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(
        getAllNotesQueryInputs,
        context?.previousNotes ?? []
      );

      toast.error("There was an error deleting your note :(");
      console.error("Error deleting note: ", err);

      void ctx.note.getAll.invalidate();
    },
  });

  const { mutateAsync: deleteNote } = api.note.delete.useMutation({
    onMutate: async (note) => {
      await ctx.note.getAll.cancel();

      // TODO: use correct previous state
      const previousNotes =
        noteMutationQueues.get(note.renderId)?.previousState ??
        ctx.note.getAll.getData(getAllNotesQueryInputs);

      return { previousNotes };
    },

    onError: (err, _newNote, context) => {
      ctx.note.getAll.setData(
        getAllNotesQueryInputs,
        context?.previousNotes ?? []
      );

      toast.error("There was an error deleting your note :(");
      console.error("Error deleting note: ", err);

      void ctx.note.getAll.invalidate();
    },
  });

  const handleDeleteNote = (note: Note) => {
    console.log("render id for delete: ", note.renderId);
    setNoteMutationQueues((draftMap) => {
      if (!draftMap.has(note.renderId)) {
        draftMap.set(note.renderId, new MutationQueue());
      }

      void draftMap.get(note.renderId)?.enqueue({
        apiCall: async () => {
          await deleteNote({ id: note.id, renderId: note.renderId });
        },
        optimisticUpdate: () => {
          ctx.note.getAll.setData(getAllNotesQueryInputs, (oldNotes) =>
            oldNotes?.filter(({ renderId }) => renderId !== note.renderId)
          );
        },
        previousState: ctx.note.getAll.getData(
          getAllNotesQueryInputs
        ) as Note[],
      });
    });

    toast.custom((t) => (
      <NotificationListItem toast={t}>
        <div className="ml-3 flex w-0 flex-1 justify-between pt-0.5">
          <p className="line-clamp-3 text-sm font-medium text-gray-900 dark:text-gray-50">
            Note deleted
          </p>

          <button
            type="button"
            className="ml-3 flex-shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-transparent"
            onClick={() => {
              const deletedNote = note;

              setNoteMutationQueues((draftMap) => {
                if (!draftMap.has(deletedNote.renderId)) {
                  draftMap.set(deletedNote.renderId, new MutationQueue());
                }

                void draftMap.get(deletedNote.renderId)?.enqueue({
                  apiCall: async () => {
                    await undoDelete({ id: note.id, renderId: note.renderId });
                  },
                  optimisticUpdate: () => {
                    const note = { ...deletedNote };

                    ctx.note.getAll.setData(
                      getAllNotesQueryInputs,
                      (oldNotes) => (oldNotes ? [...oldNotes, note] : [note])
                    );
                  },
                  previousState: ctx.note.getAll.getData(
                    getAllNotesQueryInputs
                  ) as Note[],
                });
              });

              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      </NotificationListItem>
    ));
  };

  useEffect(() => {
    if (selectedNote) {
      setIsCreateNoteModalOpen(true);
    }
  }, [selectedNote]);

  useHotkeys(getAlphanumericCharacters(), (e) => {
    if (isTypeHotkeyEnabled && isCapturingInput) {
      setSlideoverInput((str) => str + e.key);
    }

    if (isTypeHotkeyEnabled && !isCreateNoteModalOpen) {
      setSelectedNote(null);
      setIsCreateNoteModalOpen(true);
    }
  });

  useEffect(() => {
    document.body.addEventListener("touchend", swipeHandlers.onTouchEnd);
    document.body.addEventListener("touchmove", swipeHandlers.onTouchMove);
    document.body.addEventListener("touchstart", swipeHandlers.onTouchStart);

    return () => {
      document.body.removeEventListener("touchend", swipeHandlers.onTouchEnd);
      document.body.removeEventListener("touchmove", swipeHandlers.onTouchMove);
      document.body.removeEventListener(
        "touchstart",
        swipeHandlers.onTouchStart
      );
    };
  }, [
    isCreateNoteModalOpen,
    swipeHandlers,
    setSlideoverInput,
    isCapturingInput,
    isTypeHotkeyEnabled,
  ]);

  // To fix a bug where it's false after a hot reload
  useEffect(() => {
    if (!isTypeHotkeyEnabled) {
      reset();
    }
  }, [isTypeHotkeyEnabled, reset]);

  useEffect(() => {
    if (!isCreateNoteModalOpen) {
      reset();
      setSlideoverInput("");
    }
  }, [isCreateNoteModalOpen, setSlideoverInput, reset]);

  useEffect(() => {
    if (!isSignedIn) {
      void router.push("/sign-up");
    }
  }, [isSignedIn, router]);

  const isProcessingAnyQueue = (() => {
    for (const [, queue] of noteMutationQueues) {
      if (queue.isProcessingRecords) {
        return true;
      }
    }

    return false;
  })();

  if (
    !isLoaded ||
    isLoadingNotes ||
    (isFetchingNotes && isMutating && isProcessingAnyQueue) ||
    (isFetchingNotes && !notesData)
  )
    return <LoadingPage />;

  return (
    <>
      <main className="m-4 flex flex-col">
        {(() => {
          if (!notesData?.length && searchInput) {
            return undefined;
          } else if (!notesData?.length) {
            return (
              <div className="mx-auto w-full max-w-md border border-dashed border-gray-300 bg-white px-6 py-6 text-center dark:border-white/20 dark:bg-gray-900 xl:w-max xl:px-32">
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
            );
          } else {
            return (
              <div className="grid grid-cols-fill-xs gap-3">
                <AnimatePresence>
                  {notesData.map((note) => (
                    <motion.button
                      key={note.renderId}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => {
                        e.stopPropagation();

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
                          tabIndex={0}
                          onKeyDown={(e) => {
                            e.stopPropagation();

                            if (e.key === "Enter") {
                              e.preventDefault();

                              handleDeleteNote(note);
                            }
                          }}
                          onClick={(e) => {
                            e.stopPropagation();

                            handleDeleteNote(note);
                          }}
                        >
                          <XMarkIcon className="h-5 w-5 fill-yellow-700 dark:text-yellow-800" />
                        </span>
                      </div>

                      <div className="m-2 line-clamp-[8] whitespace-pre-line text-start font-sans text-sm">
                        {note.content}
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            );
          }
        })()}

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
