import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Router } from '@angular/router';
import { Note } from 'src/app/shared/node.model';
import { NotesService } from 'src/app/shared/notes.service';

@Component({
  selector: 'app-notes-list',
  templateUrl: './notes-list.component.html',
  styleUrls: ['./notes-list.component.scss'],
  animations:[
    trigger('itemAnim', [
      //ENTRY Animation
      transition('void => *', [//set initial state
        style({
          height: 0,
          opacity: 0,
          transform: 'scale(0.85)',
           'margin-bottom':0,
          //we have to exxpand the padding properties
          paddingTop: 0,
          paddingBottom: 0,
          paddingRight: 0,
          paddingLeft: 0,
        }),
        // we first want to animate the spacing (which includes height and margin)

        animate('50ms', style({
          height: '*',
          'margin-bottom' : '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*',
        })), 

        animate(68)
      ]),
      transition('* => void', [
        //first scale up
        animate(50, style({

          transform: 'scale (1.05)'
        })),
        //then scale down back to normal size while beginning to fade out
          animate(50, style({
  
            transform: 'scale (1)',
            opacity: 0.75
          })),
          //scale down and fade out completely 
          animate('120ms ease-out', style({
  
            transform: 'scale (0.68)',
            opacity: 0
          })),

          //then animate the spacing ( which includes height and margin and padding)
          animate('150ms ease-out', style({
            opacity: 0,
            height: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
            paddingLeft: 0,
            'margin-bottom': '0'

          }))

      ])
    ]), 
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({

            opacity: 0,
            height: 0
          }),
          
          stagger(100, [
            animate('0.2s ease')
        
        ])
      ],  {
        optional: true
      })
    ])
    ])
  ]
})
export class NotesListComponent implements OnInit {

  notes: Note[]= new Array<Note>();
  filteredNotes: Note[] = new Array<Note>()
  @ViewChild('filterInput') filterInputElRef: ElementRef<HTMLInputElement>

  cardTitle: string = 'abc';
  constructor(private notesService: NotesService, private router: Router) { }

  ngOnInit() {

    //we want to retrieve all notes NotesService
    this.notes=this.notesService.getAll();
  //  this.filteredNotes = this.notesService.getAll();
    this.filter('');


  }

  deleteNote(note: Note){
    let noteId = this.notesService.getId(note);
    this.notesService.delete(noteId);
    this.filter(this.filterInputElRef.nativeElement.value);

  }

  generateNoteURL(note: Note) {
    let noteId = this.notesService.getId(note);
    return noteId;
  }

  filter(query: string){
    query = query.toLowerCase().trim();
    let allResults: Note[] = new Array<Note>();
    //split up the search query into indivudal words
    let terms: string[] = query.split(' '); //split on spaces
    //remove duplicate search
    terms = this.removeDuplicates(terms);
    //compile all relevant results into the allResults array
    terms.forEach(term => {
      let results: Note[] = this.relevantNotes(term);

      //append results to the allResults array
      allResults = [...allResults, ...results]

/*       allResults will include duplicate notes because a particular note can be the result
      of many search terms, but we don't want to show the same note multiple times on the UI, so we first must remove the duplicates */
      let uniqueResults = this.removeDuplicates(allResults);
      this.filteredNotes = uniqueResults;

      //now sort by relevency
      this.sortByRelevancy(allResults);
      
    });

  }

  removeDuplicates(arr: Array<any>) : Array<any> {
    let uniqueResults: Set<any> = new Set<any>();
    //loop through the input array and add 
    arr.forEach(e => uniqueResults.add(e));

    return Array.from(uniqueResults);

  }

  relevantNotes(query: any) : Array<Note> {
    query = query.toLowerCase().trim();
    let relevantNotes = this.notes.filter(note =>{
      if (note.title &&  note.title.toLowerCase().includes(query)){
        return true;
      }

      if(note.body &&note.body.toLowerCase().includes(query)) {
        return true;
      }

      return false;

    })


    return relevantNotes;

  }



  sortByRelevancy(searchResults: Note[]) {
    //this method will calculate the relvancy of a note based on the number of times it appears in the search results

    let noteCountObj: Object = {}; // format - key:value => NoteId: number (note object id: count)

    searchResults.forEach(note => {
      let noteId = this.notesService.getId(note); //get the notes id

      if (noteCountObj[noteId]) {
        noteCountObj[noteId]+= 1;
      } else{
        noteCountObj[noteId] = 1;
      }
    })

    this.filteredNotes = this.filteredNotes.sort((a: Note, b: Note) => {
      let aId = this.notesService.getId(a);
      let bId = this.notesService.getId(b);

      let aCount = noteCountObj[aId];
      let bCount = noteCountObj[bId];
      // if the return value is a negative number, then a is sorted before b. 
      //if the return value is a postive number then b is sorted before a
      // if the return value is 0 then the order of a and b remain the same
      return bCount - aCount;
    })
 
 
  }

}
