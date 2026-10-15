import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.css'],
})
export class FileUploaderComponent {
  @Input() formControlName: string = '';
  @Input() label: string = '';
  @Input() inputId: string = 'file_input';
  @Input() settingsForm: FormGroup | undefined;
  @Input() imageUrl: string = ''; // Existing image from database
  @Output() fileSelected: EventEmitter<File> = new EventEmitter();

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  filePreview: string | null = null;
  fileName: string = '';
  ngOnChanges(changes: SimpleChanges) {
    if (changes.imageUrl && changes.imageUrl.currentValue) {
      this.filePreview = this.imageUrl;
      this.fileName = this.imageUrl.split('/').pop() || 'Existing Image';
    }
    console.log('file', this.imageUrl.split('/').pop() || 'Existing Image');
  }
  // ngOnInit() {
  //   if (this.imageUrl) {
  //     this.filePreview = this.imageUrl;
  //     this.fileName = this.imageUrl.split('/').pop() || 'Existing Image';
  //     console.log('file1', this.imageUrl.split('/').pop() || 'Existing Image');
  //   }
  //   console.log('file', this.imageUrl.split('/').pop() || 'Existing Image');
  // }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.filePreview = reader.result as string;
        if (this.settingsForm) {
          this.settingsForm.patchValue({ [this.formControlName]: file });
        }
        this.fileSelected.emit(file);
      };
      reader.readAsDataURL(file);
    }
  }

  cancelFileSelection() {
    this.filePreview = this.imageUrl || null;
    this.fileName = this.imageUrl
      ? this.imageUrl.split('/').pop() || 'Existing Image'
      : '';
    if (this.settingsForm) {
      this.settingsForm.patchValue({ [this.formControlName]: null });
    }
  }

  replaceFile() {
    this.fileInput.nativeElement.click();
  }
}
