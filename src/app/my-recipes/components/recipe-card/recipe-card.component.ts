import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [],
  templateUrl: './recipe-card.component.html',
  styleUrl: './recipe-card.component.scss',
})
export class RecipeCardComponent {
  @Input() img: string = '';
  @Input() name: string = '';

  imageUrl =
    'https://s3-alpha-sig.figma.com/img/9825/bade/56217bcc4929453aa9a2d1364f352f09?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=E-hoWeysCbB7ZY1SJnGWSS0AqVMGQxPXqImRIKhPH50q0Vk~bx0LZmwJV8cu1xPy8uR~lLeIUeKCdoZyiR7kiOyQcdq86V~EK6ZbhHcVYjoi~BtTGOKkwgrvOiDKAh5X9r0JwLvRRBVWl8aA8BDmekujTVYivWrX9uSUvQAax2pHrPDWV5KDS2NNCuIhJni~3~MKoy~nkbej17Ea26TsyTSBlkg0VZfGa~TBvlIZQZwQqYdvBk~K0l1zA3v9kI9uhG3aop9XM9EcVuziuBns4foqWE5NP9frqLoyJRiGEliZK8S6sgrdrvHO1iWBmzYZC6UK5pqrmmPOvOV9TvBHeg__';
  mealIcon =
    'https://s3-alpha-sig.figma.com/img/4dab/b1b5/ddea3fbff5bdf101cea7af30b49350ca?Expires=1710115200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=TVSb5RgxRn~ZW30yohEjSGZrUX2ZlrBiq1OhLn2~4nCPIoVBXMq4BYMMT8-hlh-Vt12owzlGJjCtT~n9bLXcxvB30R1DADXGSHKDVMP7MDn~dVkXl-T0lcnK8qozZyFynVnMrkg-X880VywWr8zar~PGIh0UCYuJ9yuqMmqnlZZ8li8VCUhRrW13vLuPYeMUs8t8sr~3CtBxd0aFEyLd7IHNiEM6NLPXESULIgCihJvQWz0qvPIlUJrjsSl6j2SEjwHhJFHv5~PZslM~XPrK0y5nF7VkYUyK6sDuZ97GKZZ2WLiyq3zagzsGAd11RJ6VX6zdhArx3Sy3912hz~~aBQ__';
}
