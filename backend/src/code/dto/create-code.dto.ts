export class CreateCodeDto {
  code: string;
  language: string;
  author: string;
  viewPassword?: string;
  editPassword?: string;
}
