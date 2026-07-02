(function($) {
  // =====================================================
  // Initialisation du plugin jQuery mauGallery
  // =====================================================

  $.fn.mauGallery = function(options) {
    // Fusionne les options personnalisées avec les options par défaut
    var options = $.extend($.fn.mauGallery.defaults, options);

    // Stocke les catégories uniques trouvées dans les images
    var tagsCollection = [];

    return this.each(function() {
      // Crée la ligne Bootstrap qui contiendra toutes les images
      $.fn.mauGallery.methods.createRowWrapper($(this));

      // Crée la modale Lightbox si l’option est activée
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // Active les écouteurs d’événements : clic image, filtre, précédent/suivant
      $.fn.mauGallery.listeners(options);

      // Parcourt chaque image de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Rend l’image responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));

          // Déplace l’image dans la ligne Bootstrap
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));

          // Encapsule l’image dans une colonne responsive
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);

          // Récupère la catégorie de l’image
          var theTag = $(this).data("gallery-tag");

          // Ajoute la catégorie à la collection si elle n’existe pas encore
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

      // Affiche les filtres de catégories si l’option est activée
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      // Affiche progressivement la galerie une fois prête
      $(this).fadeIn(500);
    });
  };

  // =====================================================
  // Options par défaut du plugin
  // =====================================================

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // =====================================================
  // Écouteurs d’événements
  // =====================================================

  $.fn.mauGallery.listeners = function(options) {
    const lightboxSelector = `#${options.lightboxId}`;

    // Ouvre la lightbox au clic sur une image
    $(".gallery")
      .off("click.mauGallery", ".gallery-item")
      .on("click.mauGallery", ".gallery-item", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Filtre les images au clic sur une catégorie
    $(".gallery")
      .off("click.mauGallery", ".nav-link")
      .on("click.mauGallery", ".nav-link", $.fn.mauGallery.methods.filterByTag);

    // Affiche l’image précédente dans la lightbox
    $(lightboxSelector)
      .off("click.mauGallery", ".mg-prev")
      .on("click.mauGallery", ".mg-prev", () =>
        $.fn.mauGallery.methods.prevImage(options.lightboxId)
      );

    // Affiche l’image suivante dans la lightbox
    $(lightboxSelector)
      .off("click.mauGallery", ".mg-next")
      .on("click.mauGallery", ".mg-next", () =>
        $.fn.mauGallery.methods.nextImage(options.lightboxId)
      );
  };

  // =====================================================
  // Méthodes principales du plugin
  // =====================================================

  $.fn.mauGallery.methods = {
    // Crée le conteneur Bootstrap qui reçoit les images
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    // Encapsule chaque image dans une colonne Bootstrap responsive
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";

        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }

        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }

        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }

        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }

        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }

        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    // Déplace une image dans la ligne principale de la galerie
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    // Ajoute la classe Bootstrap img-fluid aux images
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    // Ouvre la modale et y affiche l’image cliquée
    openLightBox(element, lightboxId) {
      const lightbox = document.getElementById(lightboxId);

      if (!lightbox) {
        return;
      }

      $(lightbox)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));

      if (window.bootstrap && bootstrap.Modal) {
        bootstrap.Modal.getOrCreateInstance(lightbox).show();
      } else if ($(lightbox).modal) {
        $(lightbox).modal("toggle");
      }
    },

    // Affiche l’image précédente dans la lightbox
    prevImage() {
      let activeImage = null;

      // Récupère l’image actuellement affichée dans la lightbox
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      // Récupère la catégorie actuellement sélectionnée
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");

      // Crée une collection d’images correspondant au filtre actif
      const imagesCollection = [];

      $(".item-column").each(function() {
        const image = $(this).children("img");

        if (
          image.length &&
          (activeTag === "all" || image.data("gallery-tag") === activeTag)
        ) {
          imagesCollection.push(image);
        }
      });

      // Retrouve la position de l’image active dans la collection
      let index = 0;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });

      // Calcule l’index précédent avec retour à la dernière image si besoin
      const previousIndex =
        index === 0 ? imagesCollection.length - 1 : index - 1;

      // Met à jour l’image affichée dans la lightbox
      $(".lightboxImage").attr("src", $(imagesCollection[previousIndex]).attr("src"));
    },

    // Affiche l’image suivante dans la lightbox
    nextImage() {
      let activeImage = null;

      // Récupère l’image actuellement affichée dans la lightbox
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });

      // Récupère la catégorie actuellement sélectionnée
      const activeTag = $(".tags-bar span.active-tag").data("images-toggle");

      // Crée une collection d’images correspondant au filtre actif
      const imagesCollection = [];

      $(".item-column").each(function() {
        const image = $(this).children("img");

        if (
          image.length &&
          (activeTag === "all" || image.data("gallery-tag") === activeTag)
        ) {
          imagesCollection.push(image);
        }
      });

      // Retrouve la position de l’image active dans la collection
      let index = 0;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          index = i;
        }
      });

      // Calcule l’index suivant avec retour à la première image si besoin
      const nextIndex =
        index === imagesCollection.length - 1 ? 0 : index + 1;

      // Met à jour l’image affichée dans la lightbox
      $(".lightboxImage").attr("src", $(imagesCollection[nextIndex]).attr("src"));
    },

    // Crée la structure HTML de la lightbox Bootstrap
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content">
              <div class="modal-body">
                ${
                  navigation
                    ? '<button type="button" class="mg-prev" aria-label="Image précédente">&lt;</button>'
                    : '<span style="display:none;" />'
                }

                <img class="lightboxImage img-fluid" alt="Image affichée dans la galerie agrandie"/>

                ${
                  navigation
                    ? '<button type="button" class="mg-next" aria-label="Image suivante">&gt;</button>'
                    : '<span style="display:none;" />'
                }
              </div>
            </div>
          </div>
        </div>`);
    },

    // Génère les boutons de filtres à partir des catégories trouvées
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag" data-images-toggle="all">Tous</span></li>';

      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item">
          <span class="nav-link" data-images-toggle="${value}">${value}</span>
        </li>`;
      });

      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      // Place les filtres au-dessus ou en-dessous de la galerie
      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    // Filtre les images selon la catégorie sélectionnée
    filterByTag() {
      // Si le filtre est déjà actif, on ne relance pas le filtrage
      if ($(this).hasClass("active-tag")) {
        return;
      }

      // Retire l’état actif de tous les filtres
      $(".tags-bar .nav-link").removeClass("active active-tag");

      // Ajoute l’état actif au filtre cliqué
      $(this).addClass("active active-tag");

      // Récupère la catégorie sélectionnée
      const tag = $(this).data("images-toggle");

      // Affiche ou masque les images selon la catégorie
      $(".gallery-item").each(function() {
        const itemColumn = $(this).parents(".item-column");

        if (tag === "all" || $(this).data("gallery-tag") === tag) {
          itemColumn.show(300);
        } else {
          itemColumn.hide();
        }
      });
    }
  };
})(jQuery);
