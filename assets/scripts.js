$(document).ready(function() {
    const $header = $('.top-header');
    const $menuToggle = $('.menu-toggle');

    $menuToggle.on('click', function() {
        const isOpen = $header.toggleClass('is-menu-open').hasClass('is-menu-open');
        $(this)
            .attr('aria-expanded', isOpen)
            .attr('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    });

    $('.top-header .nav a').on('click', function() {
        $header.removeClass('is-menu-open');
        $menuToggle
            .attr('aria-expanded', false)
            .attr('aria-label', 'Ouvrir le menu');
    });

    $('.gallery').mauGallery({
        columns: {
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 3
        },
        lightBox: true,
        lightboxId: 'myAwesomeLightbox',
        showTags: true,
        tagsPosition: 'top'
    });
});
