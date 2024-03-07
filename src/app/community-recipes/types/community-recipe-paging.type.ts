export interface CommunityRecipePagingType {
  content: CommunityRecipeType[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalelements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface CommunityRecipeType {
  recipeId: number;
  name: string;
  images: [
    {
      path: string;
      alt: string;
    },
  ];
  recipeInformation: string[];
  tags: [
    {
      tagId: string;
      tag: string;
    },
  ];
  ingredients: [
    {
      left: string;
      right: string;
      metric: [
        {
          id: string;
          name: string;
        },
      ];
    },
  ];
  manual: string;
  potions: number;
}
